import { NextRequest, NextResponse } from 'next/server';
import { getOrderByHash, updateOrder } from '@/lib/storage';
import { withHandler, jsonError, isText } from '@/lib/api';
import { Order } from '@/types/order';

export const PATCH = withHandler('update order', async (request: NextRequest) => {
  const { hash, timer_end, playEatITSong, swishNbr, swishName, restaurant } = await request.json();

  if (!hash) {
    return jsonError('Hash is required', 400);
  }

  const order = await getOrderByHash(hash);
  if (!order) {
    return jsonError('Order not found', 404);
  }

  // Each setting can only be set once, as the UI's "cannot be undone" dialogs promise
  const updates: Partial<Order> = {};
  if (timer_end !== undefined) {
    if (order.timer_end || !Number.isFinite(timer_end)) {
      return jsonError('Invalid or already set timer', 400);
    }
    updates.timer_end = timer_end;
    updates.playEatITSong = playEatITSong === true;
  }
  if (swishNbr !== undefined || swishName !== undefined) {
    if (order.swishNbr || !isText(swishNbr, 15) || !isText(swishName, 50)) {
      return jsonError('Invalid or already set swish info', 400);
    }
    updates.swishNbr = swishNbr.trim();
    updates.swishName = swishName.trim();
  }
  if (restaurant !== undefined) {
    if (order.restaurant || !isText(restaurant?.restaurantName, 100) || !isText(restaurant.linkToMenu, 500)) {
      return jsonError('Invalid or already set restaurant', 400);
    }
    updates.restaurant = { restaurantName: restaurant.restaurantName, linkToMenu: restaurant.linkToMenu };
  }

  const updatedOrder = await updateOrder(hash, updates);
  if (!updatedOrder) {
    return jsonError('Order not found', 404);
  }

  return NextResponse.json(updatedOrder);
});
