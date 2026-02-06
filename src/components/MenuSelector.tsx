'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuSelectorProps {
  hasOrders: boolean;
  hasMenu: boolean;
  onSetMenu: (restaurantName: string, linkToMenu: string) => void;
}

interface Restaurant {
  name: string;
  link_to_menu: string;
}

export function MenuSelector({ hasOrders, hasMenu, onSetMenu }: MenuSelectorProps) {
  const restaurants: Restaurant[] = [
    { name: 'Sannegårdens Pizzeria', link_to_menu: 'https://sannegardens.se/bestalla-online/?loc=johanneberg&change-method=takeaway' },
    { name: 'Pizzeria Gibraltar', link_to_menu: 'https://pizzeriagibraltar.com/' },
    { name: 'Dominos', link_to_menu: 'https://www.dominos.se/butiker/johanneberg/meny/pizza' }
  ];
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRestaurant) {
      setError('Please select a restaurant');
      return;
    }

    const restaurant = restaurants[parseInt(selectedRestaurant)];
    if (restaurant) {
      onSetMenu(restaurant.name, restaurant.link_to_menu);
    }
  };

  // Only show if there are no orders and no menu set
  if (hasOrders || hasMenu || loading || restaurants.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Set what menu from Chalmers</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-1">
            Restaurang
          </label>
          <select
            id="restaurant"
            value={selectedRestaurant}
            onChange={(e) => {
              setSelectedRestaurant(e.target.value);
              setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Välj restaurang från vart ni ska köpa ifrån</option>
            {restaurants.map((restaurant, index) => (
              <option key={index} value={index}>
                {restaurant.name}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Set menu
        </button>
      </form>
    </div>
  );
}
