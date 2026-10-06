'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Card, Field, inputClass, useToast } from '@/components/ui';

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
  const { toast, showToast } = useToast();

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
      <Card title="Place your order">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Food item" htmlFor="pizza" error={errors.pizza}>
            <input
              id="pizza"
              type="text"
              value={pizza}
              onChange={(e) => setPizza(e.target.value)}
              className={inputClass}
              placeholder="Enter what you want to eat"
            />
          </Field>

          <Field label="Nick" htmlFor="nick" error={errors.nick}>
            <input
              id="nick"
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              className={inputClass}
              placeholder='Enter an identifiable name or nick (multiple names should be separated by either "+" or "&")'
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add order'}
          </button>
        </form>
      </Card>

      {toast}
    </>
  );
});

OrderForm.displayName = 'OrderForm';
