import { NextRequest, NextResponse } from 'next/server';
import { getOrderByHash } from '@/lib/storage';
import { withHandler, jsonError } from '@/lib/api';

export const dynamic = 'force-dynamic';

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
