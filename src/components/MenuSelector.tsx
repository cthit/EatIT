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
          <select
            id="restaurant"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setError('');
            }}
            className={inputClass}
          >
            <option value="">Välj restaurang från vart ni ska köpa ifrån</option>
            {restaurants.map((restaurant, index) => (
              <option key={index} value={index}>
                {restaurant.name}
              </option>
            ))}
          </select>
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
