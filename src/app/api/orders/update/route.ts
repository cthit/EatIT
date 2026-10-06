import { NextRequest, NextResponse } from 'next/server';
import { updateOrder } from '@/lib/storage';
import { withHandler, jsonError } from '@/lib/api';

export const PATCH = withHandler('update order', async (request: NextRequest) => {
  const { hash, ...updates } = await request.json();

  if (!hash) {
    return jsonError('Hash is required', 400);
  }

  const updatedOrder = await updateOrder(hash, updates);
  if (!updatedOrder) {
    return jsonError('Order not found', 404);
  }

  return NextResponse.json(updatedOrder);
});
