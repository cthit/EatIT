import { NextRequest, NextResponse } from 'next/server';
import { getOrderItems } from '@/lib/storage';
import { withHandler, jsonError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = withHandler('fetch order items', async (request: NextRequest) => {
  const orderHash = request.nextUrl.searchParams.get('orderHash');
  if (!orderHash) {
    return jsonError('orderHash parameter is required', 400);
  }

  return NextResponse.json(await getOrderItems(orderHash));
});
