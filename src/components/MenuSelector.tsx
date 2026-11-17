'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Field, inputClass } from '@/components/ui';
import { RestaurantSummary } from '@/types/menu';
import { Restaurant } from '@/types/order';

type SetMenuHandler = (
  restaurantName: string,
  linkToMenu: string
) => void | boolean | Promise<void | boolean>;

interface MenuSelectorProps {
  restaurants: RestaurantSummary[];
  selectedRestaurant?: Restaurant;
  hasOrders: boolean;
  onSetMenu: SetMenuHandler;
}

export function MenuSelector({
  restaurants,
  selectedRestaurant,
  hasOrders,
  onSetMenu,
}: MenuSelectorProps) {
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Orders cannot pick a restaurant once people have started ordering
  if (!selectedRestaurant && hasOrders) {
    return null;
  }

  if (selectedRestaurant) {
    const restaurant = restaurants.find(
      (candidate) =>
        candidate.url === selectedRestaurant.linkToMenu ||
        candidate.name === selectedRestaurant.restaurantName
    );

    return (
      <Card title="Restaurant">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-700">
            Ordering from{' '}
            <span className="font-bold">{selectedRestaurant.restaurantName}</span>
          </p>
          <Link
            href={restaurant ? `/menus/${restaurant.id}` : '/menus'}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
          >
            Browse menu
          </Link>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const restaurant = restaurants.find((candidate) => candidate.id === selected);
    if (!restaurant) {
      setError('Please select a restaurant');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const success = await onSetMenu(restaurant.name, restaurant.url);
      if (success === false) {
        setError('Could not set the menu. Please try again.');
      }
    } catch {
      setError('Could not set the menu. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Set what menu from Chalmers">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Restaurant" htmlFor="restaurant" error={error}>
          <div className="relative">
            <select
              id="restaurant"
              value={selected}
              onChange={(event) => {
                setSelected(event.target.value);
                setError('');
              }}
              disabled={submitting}
              className={`${inputClass} appearance-none bg-white pr-10 cursor-pointer ${selected ? 'text-gray-900' : 'text-gray-400'}`}
            >
              <option value="">Choose the restaurant you are ordering from</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id} className="text-gray-900">
                  {restaurant.name}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Setting...' : 'Set menu'}
        </button>
      </form>
    </Card>
  );
}
