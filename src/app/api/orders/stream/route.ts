import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderHash = searchParams.get('orderHash');

  if (!orderHash) {
    return new Response('Missing orderHash parameter', { status: 400 });
  }

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      const db = await getDb();
      const orders = db.collection('orders');
      const orderItems = db.collection('order_items');

      // Find the order
      const order = await orders.findOne({ hash: orderHash });
      
      if (!order) {
        controller.close();
        return;
      }

      let intervalId: NodeJS.Timeout;

      // Send initial data
      const sendUpdate = async () => {
        try {
          const currentOrder = await orders.findOne({ hash: orderHash });
          const items = await orderItems
            .find({ order: order._id.toString() })
            .toArray();

          // Serialize MongoDB objects to plain JavaScript objects
          const data = {
            order: JSON.parse(JSON.stringify(currentOrder)),
            items: JSON.parse(JSON.stringify(items)),
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          console.error('Error sending update:', error);
        }
      };

      // Send initial update
      await sendUpdate();

      // Poll for changes every 2 seconds
      intervalId = setInterval(sendUpdate, 2000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
