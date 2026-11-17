'use server';

import { isText } from '@/lib/validation';
import {
  addOrderItem,
  createOrder,
  deleteOrderItem,
  getOrderByHash,
  updateOrder,
} from '@/lib/storage';
import type { ActionResult } from '@/types/action';
import type { Order, OrderItem } from '@/types/order';

function randomHash(): string {
  const hex = Math.floor(Math.random() * 0x1000).toString(16);
  return ('000' + hex).slice(-3);
}

/** Create a fresh order, retrying on hash collisions */
export async function createOrderAction(): Promise<ActionResult<string>> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const order = await createOrder(randomHash());
    if (order) return { ok: true, data: order.hash };
  }

  return { ok: false, error: 'Failed to create order' };
}

export async function addOrderItemAction(input: {
  orderHash: string;
  nick: string;
  pizza: string;
}): Promise<ActionResult<OrderItem>> {
  const { orderHash, nick, pizza } = input;

  if (!orderHash || !isText(nick, 100) || !isText(pizza, 150)) {
    return {
      ok: false,
      error: 'orderHash, nick (max 100 chars), and pizza (max 150 chars) are required',
    };
  }

  const order = await getOrderByHash(orderHash);
  if (!order) return { ok: false, error: 'Order not found' };
  if (order.timer_end) return { ok: false, error: 'Order is locked' };

  const item = await addOrderItem(orderHash, nick, pizza);
  if (!item) return { ok: false, error: 'Failed to add item' };

  return { ok: true, data: item };
}

export async function removeOrderItemAction(input: {
  orderHash: string;
  itemId: string;
}): Promise<ActionResult<null>> {
  const { orderHash, itemId } = input;

  if (!itemId || !orderHash) {
    return { ok: false, error: 'itemId and orderHash are required' };
  }

  if ((await getOrderByHash(orderHash))?.timer_end) {
    return { ok: false, error: 'Order is locked' };
  }

  if (!(await deleteOrderItem(orderHash, itemId))) {
    return { ok: false, error: 'Order item not found' };
  }

  return { ok: true, data: null };
}

export async function updateOrderAction(
  input: { hash: string } & Partial<
    Pick<Order, 'timer_end' | 'swishNbr' | 'swishName' | 'restaurant'>
  >
): Promise<ActionResult<Order>> {
  const { hash, timer_end, swishNbr, swishName, restaurant } = input;

  if (!hash) return { ok: false, error: 'Hash is required' };

  const order = await getOrderByHash(hash);
  if (!order) return { ok: false, error: 'Order not found' };

  // Each setting can only be set once, as the UI's "cannot be undone" dialogs promise
  const updates: Partial<Order> = {};
  if (timer_end !== undefined) {
    if (order.timer_end || !Number.isFinite(timer_end)) {
      return { ok: false, error: 'Invalid or already set timer' };
    }
    updates.timer_end = timer_end;
  }
  if (swishNbr !== undefined || swishName !== undefined) {
    if (order.swishNbr || !isText(swishNbr, 15) || !isText(swishName, 50)) {
      return { ok: false, error: 'Invalid or already set swish info' };
    }
    updates.swishNbr = swishNbr.trim();
    updates.swishName = swishName.trim();
  }
  if (restaurant !== undefined) {
    if (
      order.restaurant ||
      !isText(restaurant?.restaurantName, 100) ||
      !isText(restaurant.linkToMenu, 500)
    ) {
      return { ok: false, error: 'Invalid or already set restaurant' };
    }
    updates.restaurant = {
      restaurantName: restaurant.restaurantName,
      linkToMenu: restaurant.linkToMenu,
    };
  }

  const updatedOrder = await updateOrder(hash, updates);
  if (!updatedOrder) return { ok: false, error: 'Order not found' };

  return { ok: true, data: updatedOrder };
}
