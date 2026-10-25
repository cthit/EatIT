import type { Metadata } from 'next';
import Link from 'next/link';
import { menuBrowser } from '@/lib/menu-browser';
import { Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Menus - EatIT',
  description: 'Browse restaurant menus',
};

export default async function MenusPage() {
  const restaurants = await menuBrowser.listRestaurants();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">Restaurant menus</h1>

      <Card title="Choose a restaurant">
        <ul className="divide-y divide-gray-200">
          {restaurants.map((restaurant) => (
            <li key={restaurant.id}>
              <Link
                href={`/menus/${restaurant.id}`}
                className="flex justify-between items-baseline gap-4 py-3 hover:text-blue-600"
              >
                <span className="font-medium">{restaurant.name}</span>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {restaurant.hasMenu && restaurant.scrapedAt
                    ? `updated ${new Date(restaurant.scrapedAt).toLocaleString()}`
                    : 'not scraped yet'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
