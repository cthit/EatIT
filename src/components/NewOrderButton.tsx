'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { homeButtonClass } from '@/components/ui';
import { createOrderAction } from '@/lib/actions';

export function NewOrderButton() {
  const router = useRouter();
  const [creating, startTransition] = useTransition();

  const createNewOrder = () => {
    startTransition(async () => {
      try {
        const result = await createOrderAction();

        if (!result.ok) {
          throw new Error(result.error);
        }

        router.push(`/${result.data}`);
      } catch (error) {
        console.error('Error creating order:', error);
      }
    });
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
