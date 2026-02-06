import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function randomHash(): string {
  const hex = Math.floor(Math.random() * 0xfff).toString(16);
  return ('000' + hex).slice(-3);
}

export async function POST() {
  try {
    const db = await getDb();
    const orders = db.collection('orders');
    
    const hash = randomHash();
    const result = await orders.insertOne({
      hash,
      createdAt: new Date(),
    });

    return NextResponse.json({
      _id: result.insertedId.toString(),
      hash,
      createdAt: new Date(),
    });
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

    const db = await getDb();
    const orders = db.collection('orders');
    
    const order = await orders.findOne({ hash });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(JSON.parse(JSON.stringify(order)));
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
