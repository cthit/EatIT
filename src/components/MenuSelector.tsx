'use client';

import { useState } from 'react';
import { Card, Field, inputClass } from '@/components/ui';

interface MenuSelectorProps {
  hasOrders: boolean;
  hasMenu: boolean;
  onSetMenu: (restaurantName: string, linkToMenu: string) => void;
}

const restaurants = [
  { name: 'Sannegårdens Pizzeria', link: 'https://sannegardens.se/bestalla-online/?loc=johanneberg&change-method=takeaway' },
  { name: 'Pizzeria Gibraltar', link: 'https://pizzeriagibraltar.com/' },
  { name: 'Dominos', link: 'https://www.dominos.se/butiker/johanneberg/meny/pizza' },
];

export function MenuSelector({ hasOrders, hasMenu, onSetMenu }: MenuSelectorProps) {
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  // Only show if there are no orders and no menu set
  if (hasOrders || hasMenu) {
    return null;
  }

  return (
    <Card title="Set what menu from Chalmers">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const restaurant = restaurants[parseInt(selected)];
          if (!restaurant) {
            setError('Please select a restaurant');
            return;
          }
          onSetMenu(restaurant.name, restaurant.link);
        }}
      >
        <Field label="Restaurang" htmlFor="restaurant" error={error}>
          <div className="relative">
            <select
              id="restaurant"
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setError('');
              }}
              className={`${inputClass} appearance-none bg-white pr-10 cursor-pointer ${selected ? 'text-gray-900' : 'text-gray-400'}`}
            >
              <option value="">Välj restaurang från vart ni ska köpa ifrån</option>
              {restaurants.map((restaurant, index) => (
                <option key={index} value={index} className="text-gray-900">
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Set menu
        </button>
      </form>
    </Card>
  );
}
