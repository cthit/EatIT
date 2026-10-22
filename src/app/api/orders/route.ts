import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrderByHash } from '@/lib/storage';
import { withHandler, jsonError } from '@/lib/api';

function randomHash(): string {
  const hex = Math.floor(Math.random() * 0x1000).toString(16);
  return ('000' + hex).slice(-3);
}

export const POST = withHandler('create order', async () => {
  // Retry on collision with an existing order
  for (let attempt = 0; attempt < 10; attempt++) {
    const order = await createOrder(randomHash());
    if (order) return NextResponse.json(order);
  }
  return jsonError('Failed to create order', 503);
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
