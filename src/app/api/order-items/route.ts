import { NextRequest, NextResponse } from 'next/server';
import { getOrderItems, addOrderItem, deleteOrderItem, getOrderByHash } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderHash = searchParams.get('orderHash');

    if (!orderHash) {
      return NextResponse.json(
        { error: 'orderHash parameter is required' },
        { status: 400 }
      );
    }

    const items = await getOrderItems(orderHash);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderHash, nick, pizza } = await request.json();

    if (!orderHash || !nick || !pizza) {
      return NextResponse.json(
        { error: 'orderHash, nick, and pizza are required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await getOrderByHash(orderHash);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const newItem = await addOrderItem(orderHash, nick, pizza);
    
    if (!newItem) {
      return NextResponse.json(
        { error: 'Failed to add item' },
        { status: 500 }
      );
    }

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating order item:', error);
    return NextResponse.json(
      { error: 'Failed to create order item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { itemId, orderHash } = await request.json();

    if (!itemId || !orderHash) {
      return NextResponse.json(
        { error: 'itemId and orderHash are required' },
        { status: 400 }
      );
    }

    const success = await deleteOrderItem(orderHash, itemId);

    if (!success) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order item:', error);
    return NextResponse.json(
      { error: 'Failed to delete order item' },
      { status: 500 }
    );
  }
}
