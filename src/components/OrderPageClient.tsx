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
  const orderFormRef = useRef<OrderFormRef>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let stopped = false;
    let retryDelay = 1000;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/api/ws?orderHash=${hash}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data.order) return; // Order expired or missing
        setOrder(data.order);
        setOrderItems(data.items);
        retryDelay = 1000;
      };

      ws.onclose = () => {
        if (!stopped) {
          retryTimer = setTimeout(connect, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 30000);
        }
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
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

  const timerStarted = Boolean(order.timer_end);
  const hasOrders = orderItems.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">EatIT Order</h1>

      <div className="space-y-6">
        {!timerStarted && (
          <OrderForm ref={orderFormRef} orderHash={hash} />
        )}

        <OrdersList
          orderItems={orderItems}
          orderHash={hash}
          timerStarted={timerStarted}
          onPizzaClick={timerStarted ? undefined : (pizzaName) => orderFormRef.current?.setPizzaField(pizzaName)}
        />

        <MenuSelector
          hasOrders={hasOrders}
          hasMenu={Boolean(order.restaurant?.restaurantName)}
          onSetMenu={(restaurantName, linkToMenu) =>
            updateOrder({ restaurant: { restaurantName, linkToMenu } })
          }
        />

        <SwishInfo
          order={order}
          onSubmit={(swishName, swishNbr) => updateOrder({ swishName, swishNbr })}
        />

        <Timer
          hasOrders={hasOrders}
          timerStarted={timerStarted}
          timeEnd={order.timer_end}
          onSetTimer={(timerEnd) => updateOrder({ timer_end: timerEnd })}
        />

        <ShareSection restaurant={order.restaurant} />
      </div>
    </div>
  );
}
