import { NextRequest } from 'next/server';
import { getOrderWithItems, getOrderLastModified } from '@/lib/storage';

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
      let heartbeatInterval: NodeJS.Timeout;
      let pollInterval: NodeJS.Timeout;
      let lastDataSent: string | null = null;
      let lastModified: number | null = null;
      
      // Send updates
      const sendUpdate = async () => {
        try {
          const { order, items } = await getOrderWithItems(orderHash);

          if (!order) {
            cleanup();
            return;
          }

          const data = { order, items };
          const dataStr = JSON.stringify(data);
          
          // Only send if data actually changed
          if (dataStr !== lastDataSent) {
            lastDataSent = dataStr;
            controller.enqueue(
              encoder.encode(`data: ${dataStr}\n\n`)
            );
          }
        } catch (error) {
          console.error('Error sending update:', error);
        }
      };

      // Check for modifications
      const checkForUpdates = async () => {
        try {
          const currentLastModified = await getOrderLastModified(orderHash);
          
          if (currentLastModified === null) {
            cleanup();
            return;
          }

          // If last_modified has changed, send an update
          if (lastModified === null || currentLastModified > lastModified) {
            console.log(`Order ${orderHash} modified at ${currentLastModified}, was ${lastModified}`);
            lastModified = currentLastModified;
            await sendUpdate();
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      };

      // Clean up on close
      const cleanup = () => {
        console.log(`Cleaning up stream for order ${orderHash}`);
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        try {
          controller.close();
        } catch (e) {
          // Stream may already be closed
        }
      };

      // Send initial update and get initial last_modified
      lastModified = await getOrderLastModified(orderHash);
      await sendUpdate();
      console.log(`Stream started for order ${orderHash}, last_modified: ${lastModified}`);

      // Poll for changes every 1 second
      pollInterval = setInterval(checkForUpdates, 1000);

      // Send heartbeat every 15 seconds to keep connection alive
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (e) {
          cleanup();
        }
      }, 15000);

      request.signal.addEventListener('abort', cleanup);
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
