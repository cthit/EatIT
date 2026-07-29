import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrderByHash } from '@/lib/storage';
import '@/lib/init'; // Initialize cleanup service

function randomHash(): string {
  const hex = Math.floor(Math.random() * 0xfff).toString(16);
  return ('000' + hex).slice(-3);
}

export async function POST() {
  try {
    const hash = randomHash();
    const order = await createOrder(hash);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash parameter is required' },
        { status: 400 }
      );
    }

    const order = await getOrderByHash(hash);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
