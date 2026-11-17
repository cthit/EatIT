'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, RestaurantSummary } from '@/types/menu';
import { describePrice, formatPriceShort } from '@/lib/price';
import { Card } from '@/components/ui';
import { PriceChoices } from '@/components/PriceChoices';
import { getMenuAction } from '@/lib/actions';

interface MenuBrowserProps {
  restaurants: RestaurantSummary[];
  canSelectItems?: boolean;
  onSelectItem?: (itemName: string) => void;
  onSelectRestaurant?: (name: string, url: string) => void;
}

export function MenuBrowser({
  restaurants,
  canSelectItems = true,
  onSelectItem,
  onSelectRestaurant,
}: MenuBrowserProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [openChoices, setOpenChoices] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const loadedMenu = await getMenuAction(restaurant.id);
      if (loadedMenu) setMenu(loadedMenu);
    } catch {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
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
                  <p className="text-sm text-gray-500">
                    This menu has not been fetched yet. Menus are refreshed automatically.
                  </p>
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
                                      title={describePrice(item.price)}
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
                                        title={describePrice(item.price)}
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

                    <Link
                      href={`/menus/${restaurant.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View full menu
                    </Link>
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
