import { NextRequest, NextResponse } from 'next/server';
import { updateOrder } from '@/lib/storage';

export async function PATCH(request: NextRequest) {
  try {
    const { hash, ...updates } = await request.json();

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash is required' },
        { status: 400 }
      );
    }

    const updatedOrder = await updateOrder(hash, updates);

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
