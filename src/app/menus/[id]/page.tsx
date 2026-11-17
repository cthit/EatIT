import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { menuBrowser } from '@/lib/menu-browser';
import { scraperRegistry } from '@/lib/scrapers';
import { describePrice, formatPriceShort } from '@/lib/price';
import { Card } from '@/components/ui';
import { PriceChoices } from '@/components/PriceChoices';

export const dynamic = 'force-dynamic';

interface MenuPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { id } = await params;
  const scraper = scraperRegistry.byId(id);
  return { title: `${scraper?.name ?? 'Menu'} - EatIT` };
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { id } = await params;

  const scraper = scraperRegistry.byId(id);
  if (!scraper) notFound();

  const menu = await menuBrowser.getMenu(id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/menus" className="text-sm text-gray-300 hover:text-white">
        &larr; All restaurants
      </Link>
      <h1 className="text-4xl font-bold mt-2 mb-8 text-white">{scraper.name}</h1>

      <Card title={menu ? `Menu - updated ${new Date(menu.scrapedAt).toLocaleString()}` : 'Menu'}>
        {!menu && (
          <p className="text-sm text-gray-600">
            This menu has not been fetched yet. Menus are refreshed automatically.
          </p>
        )}

        {menu && (
          <div className="space-y-5">
            {menu.sections.map((section, index) => (
              <div key={`${section.name}-${index}`}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {section.name}
                </h3>
                <ul className="mt-1 divide-y divide-gray-100">
                  {section.items.map((item, itemIndex) => {
                    const hasChoices = item.price?.kind === 'options';

                    const label = (
                      <span>
                        <span className="text-gray-900">{item.name}</span>
                        {(item.ingredients || item.description) && (
                          <span className="block text-xs text-gray-500">
                            {item.ingredients
                              ? item.ingredients.join(', ')
                              : item.description}
                          </span>
                        )}
                      </span>
                    );

                    const price =
                      item.price && (
                        <span
                          className="text-gray-500 whitespace-nowrap"
                          title={describePrice(item.price)}
                        >
                          {formatPriceShort(item.price)}
                        </span>
                      );

                    return (
                      <li key={`${item.name}-${itemIndex}`}>
                        {hasChoices && item.price ? (
                          <details className="group">
                            <summary className="flex justify-between items-baseline gap-4 py-1.5 text-sm cursor-pointer list-none rounded px-1 -mx-1 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                              {label}
                              <span className="flex items-baseline gap-1">
                                {price}
                                <span
                                  aria-hidden
                                  className="inline-block text-xs text-gray-400 transition-transform group-open:rotate-180"
                                >
                                  ▾
                                </span>
                              </span>
                            </summary>
                            <PriceChoices price={item.price} />
                          </details>
                        ) : (
                          <div className="flex justify-between items-baseline gap-4 py-1.5 text-sm">
                            {label}
                            {price}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
