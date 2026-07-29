'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';

interface OrderFormProps {
  orderHash: string;
}

export interface OrderFormRef {
  setPizzaField: (pizza: string) => void;
}

export const OrderForm = forwardRef<OrderFormRef, OrderFormProps>(({ orderHash }, ref) => {
  const [pizza, setPizza] = useState('');
  const [nick, setNick] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ pizza?: string; nick?: string }>({});
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  useImperativeHandle(ref, () => ({
    setPizzaField: (pizzaName: string) => {
      setPizza(pizzaName);
      setErrors(prev => ({ ...prev, pizza: undefined }));
    }
  }));

  const validate = () => {
    const newErrors: { pizza?: string; nick?: string } = {};

    if (!pizza.trim()) {
      newErrors.pizza = 'You have to enter what you want to eat';
    } else if (pizza.trim().length > 150) {
      newErrors.pizza = 'Food item can at most be 150 characters long';
    }

    if (!nick.trim()) {
      newErrors.nick = 'You have to enter an identifiable name or nick';
    } else if (nick.trim().length > 100) {
      newErrors.nick = 'Nick can at most be 100 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/order-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderHash,
          pizza: pizza.trim(),
          nick: nick.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add order');
      }

      showToast(`You have added ${pizza} as ${nick}`);
      setPizza('');
      setNick('');
      setErrors({});
    } catch (error) {
      console.error('Error adding order:', error);
      showToast('Something went wrong...');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Place your order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pizza" className="block text-sm font-medium text-gray-700 mb-1">
              Food item
            </label>
            <input
              id="pizza"
              type="text"
              value={pizza}
              onChange={(e) => setPizza(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter what you want to eat"
            />
            {errors.pizza && (
              <p className="mt-1 text-sm text-red-600">{errors.pizza}</p>
            )}
          </div>

          <div>
            <label htmlFor="nick" className="block text-sm font-medium text-gray-700 mb-1">
              Nick
            </label>
            <input
              id="nick"
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='Enter an identifiable name or nick (multiple names should be separated by either "+" or "&")'
            />
            {errors.nick && (
              <p className="mt-1 text-sm text-red-600">{errors.nick}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add order'}
          </button>
        </form>
      </div>

      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
          {toast.message}
        </div>
      )}
    </>
  );
});

OrderForm.displayName = 'OrderForm';
