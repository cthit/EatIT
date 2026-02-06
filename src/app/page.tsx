'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
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
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-6">EatIT</h1>
        <p className="text-xl text-gray-600 mb-8">
          Organize food orders with your friends easily
        </p>

        <button
          onClick={createNewOrder}
          disabled={creating}
          className="bg-blue-600 text-white text-xl py-4 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg transition-colors"
        >
          {creating ? 'Creating...' : 'New order'}<br/>
          <span className="text-sm text-gray-200">
            Eat together
          </span>
        </button>
        <button
          disabled
          className="bg-blue-600 text-white text-xl py-4 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg transition-colors ml-4"
        >
          See menus<br/>
          <span className="text-sm text-gray-200">
            Coming soon
          </span>
        </button>

        <p className="text-gray-500 mt-4 text-sm">
          Orders are automatically deleted after 24 hours
        </p>
      </div>
    </div>
  );
}

