'use client';

import { useEffect, useState, useRef } from 'react';
import { Order, OrderItem } from '@/types/order';
import { OrderForm, OrderFormRef } from '@/components/OrderForm';
import { OrdersList } from '@/components/OrdersList';
import { Timer } from '@/components/Timer';
import { SwishInfo } from '@/components/SwishInfo';
import { ShareSection } from '@/components/ShareSection';
import { MenuSelector } from '@/components/MenuSelector';

interface OrderPageClientProps {
  hash: string;
  initialOrder: Order;
  initialOrderItems: OrderItem[];
}

export default function OrderPageClient({ hash, initialOrder, initialOrderItems }: OrderPageClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrderItems);
  const [timerExpired, setTimerExpired] = useState(false);
  const orderFormRef = useRef<OrderFormRef>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 1000;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/api/ws?orderHash=${hash}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setOrder(data.order);
        setOrderItems(data.items);
        retryCount = 0;
      };

      ws.onclose = () => {
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          retryCount++;
          setTimeout(connect, delay);
        }
      };
    };

    connect();

    return () => {
      ws?.close();
    };
  }, [hash]);

  const updateOrder = async (updates: Partial<Order>) => {
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleTimerExpired = () => {
    setTimerExpired(true);
  };

  const handlePizzaClick = (pizzaName: string) => {
    if (orderFormRef.current) {
      orderFormRef.current.setPizzaField(pizzaName);
    }
  };

  const timerStarted = Boolean(order.timer_end);
  const hasOrders = orderItems.length > 0;
  const hasMenu = Boolean(order.restaurant?.restaurantName);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">EatIT Order</h1>

      <div className="space-y-6">
        {!timerStarted && (
          <OrderForm ref={orderFormRef} orderHash={hash} />
        )}

        <OrdersList
          orderItems={orderItems}
          orderHash={hash}
          timerStarted={timerStarted}
          onPizzaClick={handlePizzaClick}
        />

        <MenuSelector
          hasOrders={hasOrders}
          hasMenu={hasMenu}
          onSetMenu={(restaurantName, linkToMenu) => {
            updateOrder({
              restaurant: { restaurantName, linkToMenu }
            });
          }}
        />

        <SwishInfo
          order={order}
          onSubmit={(swishName, swishNbr) => {
            updateOrder({ swishName, swishNbr });
          }}
        />

        <Timer
          hasOrders={hasOrders}
          timerStarted={timerStarted}
          timeEnd={order.timer_end}
          onSetTimer={(timerEnd, playEatITSong) => {
            updateOrder({ timer_end: timerEnd, playEatITSong });
          }}
          onExpiry={handleTimerExpired}
        />

        <ShareSection
          url={typeof window !== 'undefined' ? window.location.href : ''}
          restaurant={order.restaurant}
        />

        {timerExpired && order.playEatITSong && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/ZcJjMnHoIBI?autoplay=1&start=51&controls=0"
              title="EatIT Song"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}
