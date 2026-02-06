import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    const db = await getDb();
    const orders = db.collection('orders');
    const orderItems = db.collection('order_items');
    
    // Find the order to get its _id
    const order = await orders.findOne({ hash: orderHash });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const items = await orderItems
      .find({ order: order._id.toString() })
      .toArray();

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

    const db = await getDb();
    const orders = db.collection('orders');
    const orderItems = db.collection('order_items');
    
    // Find the order to get its _id
    const order = await orders.findOne({ hash: orderHash });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const result = await orderItems.insertOne({
      order: order._id.toString(),
      nick: nick.trim(),
      pizza: pizza.trim(),
      createdAt: new Date(),
    });

    const newItem = await orderItems.findOne({ _id: result.insertedId });
    return NextResponse.json(JSON.parse(JSON.stringify(newItem)));
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
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const orderItems = db.collection('order_items');
    
    const result = await orderItems.deleteOne({ _id: new ObjectId(itemId) });

    if (result.deletedCount === 0) {
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
