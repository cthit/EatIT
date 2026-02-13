import { NextRequest } from 'next/server';
import { getOrderWithItems } from '@/lib/storage';

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
      let intervalId: NodeJS.Timeout;

      // Send updates
      const sendUpdate = async () => {
        try {
          const { order, items } = await getOrderWithItems(orderHash);

          if (!order) {
            clearInterval(intervalId);
            controller.close();
            return;
          }

          const data = { order, items };

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
