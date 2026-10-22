import { WebSocket } from 'ws';
import { NextRequest } from 'next/server';
import { onOrderEvent } from '@/lib/events';
import { getOrderWithItems } from '@/lib/storage';

export function GET() {
  const headers = new Headers();
  headers.set('Connection', 'Upgrade');
  headers.set('Upgrade', 'websocket');
  return new Response('Upgrade Required', { status: 426, headers });
}

export function UPGRADE(
  client: WebSocket,
  _server: import('ws').WebSocketServer,
  request: NextRequest
) {
  const orderHash = request.nextUrl.searchParams.get('orderHash');

  if (!orderHash) {
    client.close(4000, 'Missing orderHash parameter');
    return;
  }

  const sendFullData = async () => {
    try {
      const data = await getOrderWithItems(orderHash);
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error sending WebSocket data:', error);
    }
  };

  sendFullData();

  const unsubscribe = onOrderEvent(orderHash, () => {
    sendFullData();
  });

  client.once('close', () => {
    unsubscribe();
  });
}
