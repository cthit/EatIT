import { MenuSection } from '@/types/menu';
import { RestaurantScraper } from '../base/scraper';

const TAKEAWAY_DELIVERY_TYPE = 104;

interface OrdineCategory {
  id: number;
  name: string;
}

interface OrdineItem {
  name: string;
  description: string | null;
  price: number | null;
  current_price: number | null;
  category_id: number;
  categories?: OrdineCategory[];
  available?: boolean;
  is_visible_online?: boolean;
}

interface OrdineMenuPayload {
  categories?: OrdineCategory[];
  items?: OrdineItem[];
}

/**
 * Abstract scraper for restaurants hosted on the Ordine ordering platform
 * (ordine.se white-label sites). The menu API endpoint is POST-only and
 * returns the full menu as JSON when asked to create a takeaway cart.
 *
 * Concrete restaurants only provide id, name and their API URL.
 */
export abstract class OrdineScraper extends RestaurantScraper {
  protected override async fetchHtml(url: string = this.homeUrl): Promise<string> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Undici's default Accept-Language "*" makes the Ordine API return 500
        'Accept-Language': 'sv',
        'User-Agent': 'EatIT/1.0 (menu scraper)',
      },
      body: JSON.stringify({
        cartId: crypto.randomUUID(),
        deliveryType: TAKEAWAY_DELIVERY_TYPE,
        tableName: null,
        orderTime: null,
        type: null,
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url} (HTTP ${response.status})`);
    }

    return await response.text();
  }

  protected parseMenu(html: string, _url: string): MenuSection[] {
    const data = JSON.parse(html) as OrdineMenuPayload;
    if (!Array.isArray(data.items)) {
      throw new Error('Unexpected menu payload: items missing');
    }

    const categoryNames = new Map((data.categories ?? []).map((category) => [category.id, category.name]));
    const sections: MenuSection[] = [];
    const sectionByCategoryId = new Map<number, MenuSection>();

    for (const item of data.items) {
      if (item.available === false || item.is_visible_online === false) continue;

      const leafCategory = item.categories?.[item.categories.length - 1];
      const categoryId = leafCategory?.id ?? item.category_id;

      let section = sectionByCategoryId.get(categoryId);
      if (!section) {
        section = {
          name: leafCategory?.name ?? categoryNames.get(categoryId) ?? 'Menu',
          items: [],
        };
        sectionByCategoryId.set(categoryId, section);
        sections.push(section);
      }

      const price = item.current_price ?? item.price;
      section.items.push({
        name: item.name.trim(),
        price: price != null ? formatPrice(price) : undefined,
        description: item.description?.trim() || undefined,
      });
    }

    return sections;
  }
}

function formatPrice(price: number): string {
  const formatted = Number.isInteger(price)
    ? String(price)
    : price.toFixed(2).replace('.', ',');
  return `${formatted} kr`;
}
