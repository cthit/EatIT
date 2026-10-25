'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, RestaurantSummary } from '@/types/menu';
import { formatPrice, formatPriceShort } from '@/lib/price';
import { Card } from '@/components/ui';
import { PriceChoices } from '@/components/PriceChoices';

interface MenuBrowserProps {
  canSelectItems?: boolean;
  onSelectItem?: (itemName: string) => void;
  onSelectRestaurant?: (name: string, url: string) => void;
}

export function MenuBrowser({ canSelectItems = true, onSelectItem, onSelectRestaurant }: MenuBrowserProps) {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [openChoices, setOpenChoices] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/restaurants')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: RestaurantSummary[]) => {
        if (!cancelled) setRestaurants(data);
      })
      .catch(() => {
        if (!cancelled) setRestaurants([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openRestaurant = async (restaurant: RestaurantSummary) => {
    if (expandedId === restaurant.id) {
      setExpandedId(null);
      setMenu(null);
      setOpenChoices(null);
      return;
    }

    setExpandedId(restaurant.id);
    setMenu(null);
    setOpenChoices(null);
    setError('');

    if (!restaurant.hasMenu) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}`);
      if (res.status === 404) return; // Never scraped successfully
      if (!res.ok) throw new Error('Failed to load menu');
      setMenu(await res.json());
    } catch {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const scrape = async (restaurant: RestaurantSummary) => {
    setScraping(true);
    setError('');

    try {
      const res = await fetch('/api/restaurants/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scrape failed');

      setMenu(data);
      setOpenChoices(null);
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurant.id
            ? { ...r, hasMenu: true, scrapedAt: data.scrapedAt }
            : r
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scrape failed');
    } finally {
      setScraping(false);
    }
  };

  if (restaurants.length === 0) return null;

  return (
    <Card title="Browse restaurant menus">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <ul className="divide-y divide-gray-200">
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            <div className="flex items-center justify-between py-2 gap-2">
              <button
                type="button"
                onClick={() => openRestaurant(restaurant)}
                className="text-left flex-1 min-w-0 hover:text-blue-600"
              >
                <span className="font-medium">{restaurant.name}</span>
                {restaurant.hasMenu && restaurant.scrapedAt && (
                  <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                    updated {new Date(restaurant.scrapedAt).toLocaleString()}
                  </span>
                )}
              </button>

              {onSelectRestaurant && (
                <button
                  type="button"
                  onClick={() => onSelectRestaurant(restaurant.name, restaurant.url)}
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Use this menu
                </button>
              )}
            </div>

            {expandedId === restaurant.id && (
              <div className="pb-3 pl-1">
                {loading && <p className="text-sm text-gray-500">Loading menu...</p>}

                {!loading && !menu && (
                  <button
                    type="button"
                    onClick={() => scrape(restaurant)}
                    disabled={scraping}
                    className="bg-blue-600 text-white text-sm py-1.5 px-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {scraping
                      ? 'Scraping...'
                      : restaurant.hasMenu
                        ? 'Reload menu'
                        : 'Scrape menu'}
                  </button>
                )}

                {menu && (
                  <div className="space-y-4">
                    {menu.sections.map((section, index) => (
                      <div key={`${section.name}-${index}`}>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          {section.name}
                        </h3>
                        <ul className="mt-1 divide-y divide-gray-100">
                          {section.items.map((item, itemIndex) => {
                            const choicesKey = `${index}-${itemIndex}`;
                            const choicesOpen = openChoices === choicesKey;

                            return (
                              <li key={`${item.name}-${itemIndex}`}>
                                <div className="flex justify-between items-baseline gap-4 py-1.5">
                                  <button
                                    type="button"
                                    onClick={() => onSelectItem?.(item.name)}
                                    disabled={!canSelectItems}
                                    title={
                                      canSelectItems
                                        ? `Add ${item.name} to your order`
                                        : undefined
                                    }
                                    className="flex-1 min-w-0 text-left text-sm hover:bg-gray-50 disabled:hover:bg-transparent disabled:cursor-default rounded px-1 -mx-1"
                                  >
                                    <span className="text-gray-900">{item.name}</span>
                                    {(item.ingredients || item.description) && (
                                      <span className="block text-xs text-gray-500">
                                        {item.ingredients
                                          ? item.ingredients.join(', ')
                                          : item.description}
                                      </span>
                                    )}
                                  </button>

                                  {item.price && item.price.kind === 'options' ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenChoices(
                                          choicesOpen ? null : choicesKey
                                        )
                                      }
                                      aria-expanded={choicesOpen}
                                      title={formatPrice(item.price)}
                                      className="text-sm text-gray-500 whitespace-nowrap hover:text-blue-600"
                                    >
                                      {formatPriceShort(item.price)}
                                      <span
                                        aria-hidden
                                        className={`inline-block ml-1 text-xs transition-transform ${
                                          choicesOpen ? 'rotate-180' : ''
                                        }`}
                                      >
                                        ▾
                                      </span>
                                    </button>
                                  ) : (
                                    item.price && (
                                      <span
                                        className="text-sm text-gray-500 whitespace-nowrap"
                                        title={formatPrice(item.price)}
                                      >
                                        {formatPriceShort(item.price)}
                                      </span>
                                    )
                                  )}
                                </div>

                                {choicesOpen && item.price && (
                                  <PriceChoices price={item.price} />
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => scrape(restaurant)}
                        disabled={scraping}
                        className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                      >
                        {scraping ? 'Scraping...' : 'Refresh menu'}
                      </button>
                      <Link
                        href={`/menus/${restaurant.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View full menu
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
