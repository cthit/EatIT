import { NextRequest, NextResponse } from 'next/server';
import { getOrderItems, addOrderItem, deleteOrderItem, getOrderByHash } from '@/lib/storage';
import { withHandler, jsonError, isText } from '@/lib/api';

export const GET = withHandler('fetch order items', async (request: NextRequest) => {
  const orderHash = request.nextUrl.searchParams.get('orderHash');
  if (!orderHash) {
    return jsonError('orderHash parameter is required', 400);
  }

  return NextResponse.json(await getOrderItems(orderHash));
});

export const POST = withHandler('create order item', async (request: NextRequest) => {
  const { orderHash, nick, pizza } = await request.json();

  if (!orderHash || !isText(nick, 100) || !isText(pizza, 150)) {
    return jsonError('orderHash, nick (max 100 chars), and pizza (max 150 chars) are required', 400);
  }

  const order = await getOrderByHash(orderHash);
  if (!order) {
    return jsonError('Order not found', 404);
  }
  if (order.timer_end) {
    return jsonError('Order is locked', 409);
  }

  const newItem = await addOrderItem(orderHash, nick, pizza);
  if (!newItem) {
    return jsonError('Failed to add item', 500);
  }

  return NextResponse.json(newItem);
});

export const DELETE = withHandler('delete order item', async (request: NextRequest) => {
  const { itemId, orderHash } = await request.json();

  if (!itemId || !orderHash) {
    return jsonError('itemId and orderHash are required', 400);
  }

  if ((await getOrderByHash(orderHash))?.timer_end) {
    return jsonError('Order is locked', 409);
  }

  if (!(await deleteOrderItem(orderHash, itemId))) {
    return jsonError('Order item not found', 404);
  }

  return NextResponse.json({ success: true });
});
