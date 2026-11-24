'use client';

import { useEffect, useState, useRef } from 'react';
import { Order, OrderItem } from '@/types/order';
import { RestaurantSummary } from '@/types/menu';
import { OrderForm, OrderFormRef } from '@/components/OrderForm';
import { OrdersList } from '@/components/OrdersList';
import { Timer } from '@/components/Timer';
import { SwishInfo } from '@/components/SwishInfo';
import { ShareSection } from '@/components/ShareSection';
import { MenuSelector } from '@/components/MenuSelector';
import { updateOrderAction } from '@/lib/actions';

interface OrderPageClientProps {
  hash: string;
  initialOrder: Order;
  initialOrderItems: OrderItem[];
  restaurants: RestaurantSummary[];
}

export default function OrderPageClient({
  hash,
  initialOrder,
  initialOrderItems,
  restaurants,
}: OrderPageClientProps) {
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

  const updateOrder = async (updates: Partial<Order>): Promise<boolean> => {
    try {
      const result = await updateOrderAction({ hash, ...updates });

      if (!result.ok) {
        throw new Error(result.error);
      }

      // Apply immediately instead of waiting for the websocket echo
      setOrder(result.data);
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      return false;
    }
  };

  const timerStarted = Boolean(order.timer_end);
  const hasOrders = orderItems.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        EatIT Order
      </h1>

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
          restaurants={restaurants}
          selectedRestaurant={order.restaurant}
          hasOrders={hasOrders}
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

        <ShareSection />
      </div>
    </div>
  );
}
