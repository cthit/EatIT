'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { homeButtonClass } from '@/components/ui';

export function NewOrderButton() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const createNewOrder = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      router.push(`/${data.hash}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setCreating(false);
    }
  };

  return (
    <button onClick={createNewOrder} disabled={creating} className={homeButtonClass}>
      {creating ? 'Creating...' : 'New order'}<br/>
      <span className="text-sm text-gray-200">
        Eat together
      </span>
    </button>
  );
}
