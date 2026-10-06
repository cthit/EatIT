import { NextRequest, NextResponse } from 'next/server';
import { getOrderItems, addOrderItem, deleteOrderItem, getOrderByHash } from '@/lib/storage';
import { withHandler, jsonError } from '@/lib/api';

export const GET = withHandler('fetch order items', async (request: NextRequest) => {
  const orderHash = request.nextUrl.searchParams.get('orderHash');
  if (!orderHash) {
    return jsonError('orderHash parameter is required', 400);
  }

  return NextResponse.json(await getOrderItems(orderHash));
});

export const POST = withHandler('create order item', async (request: NextRequest) => {
  const { orderHash, nick, pizza } = await request.json();

  if (!orderHash || !nick || !pizza) {
    return jsonError('orderHash, nick, and pizza are required', 400);
  }

  if (!(await getOrderByHash(orderHash))) {
    return jsonError('Order not found', 404);
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

  if (!(await deleteOrderItem(orderHash, itemId))) {
    return jsonError('Order item not found', 404);
  }

  return NextResponse.json({ success: true });
});
