'use client';

import { useState } from 'react';
import { OrderItem } from '@/types/order';
import _ from 'lodash';

interface OrdersListProps {
  orderItems: OrderItem[];
  orderHash: string;
  timerStarted: boolean;
  onPizzaClick?: (pizzaName: string) => void;
}

interface GroupedItem {
  name: string;
  items: OrderItem[];
}

export function OrdersList({ orderItems, orderHash, timerStarted, onPizzaClick }: OrdersListProps) {
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 5000);
  };

  const handleRemove = async (item: OrderItem) => {
    try {
      const response = await fetch('/api/order-items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item._id, orderHash }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove order item');
      }

      showToast(`${item.pizza} by ${item.nick} has been removed.`);
    } catch (error) {
      console.error('Error removing order item:', error);
      showToast('Failed to remove item');
    }
  };

  const handlePizzaClick = (pizzaName: string) => {
    if (onPizzaClick) {
      onPizzaClick(pizzaName);
      showToast(`"${pizzaName}" copied to order form`);
    }
  };

  const copyNamesToClipboard = async () => {
    const nicks = orderItems
      .flatMap(item => item.nick.split(/\s*\+\s*|\s*&\s*/))
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(nicks);
      showToast('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy to clipboard');
    }
  };

  // Group items by pizza name
  const groupedPizzas: GroupedItem[] = _.chain(orderItems)
    .groupBy('pizza')
    .map((items, name) => ({ name, items }))
    .sortBy(group => -group.items.length)
    .value();

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 min-h-[150px]">
        <h2 className="text-2xl font-bold mb-4">Orders</h2>
        
        {orderItems.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xl text-gray-500">No items have been added</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-w-full overflow-x-auto space-y-3">
              {groupedPizzas.map((group) => (
                <div key={group.name} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className={`font-bold text-lg ${onPizzaClick ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                      onClick={() => handlePizzaClick(group.name)}
                      title={onPizzaClick ? 'Click to order this item' : undefined}
                    >
                      {group.name}
                    </h3>
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      {group.items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div
                        key={item._id?.toString()}
                        className="flex justify-between items-center bg-white p-2 rounded"
                      >
                        <span className="text-gray-700">{item.nick}</span>
                        {!timerStarted && (
                          <button
                            onClick={() => handleRemove(item)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="flex justify-between items-center">
              <p className="text-gray-700">
                Total items: {orderItems.length}
              </p>
              <button
                onClick={copyNamesToClipboard}
                disabled={orderItems.length === 0}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Copy names to clipboard
              </button>
            </div>
          </div>
        )}
      </div>

      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
          {toast.message}
        </div>
      )}
    </>
  );
}
