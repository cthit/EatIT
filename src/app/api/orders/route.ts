import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrderByHash } from '@/lib/storage';
import { withHandler, jsonError } from '@/lib/api';

function randomHash(): string {
  const hex = Math.floor(Math.random() * 0xfff).toString(16);
  return ('000' + hex).slice(-3);
}

export const POST = withHandler('create order', async () => {
  return NextResponse.json(await createOrder(randomHash()));
});

export const GET = withHandler('fetch order', async (request: NextRequest) => {
  const hash = request.nextUrl.searchParams.get('hash');
  if (!hash) {
    return jsonError('Hash parameter is required', 400);
  }

  const order = await getOrderByHash(hash);
  if (!order) {
    return jsonError('Order not found', 404);
  }

  return NextResponse.json(order);
});
