import { MenuItem, MenuPrice, MenuSection } from '@/types/menu';
import { RestaurantScraper } from '../base/scraper';

interface LdOffer {
  price?: number;
  lowPrice?: number;
  highPrice?: number;
}

interface LdMenuItem {
  name?: string;
  url?: string;
  description?: string;
  offers?: LdOffer;
}

interface LdMenuSection {
  name?: string;
  hasMenuItem?: LdMenuItem[];
}

interface LdNode {
  '@type'?: string | string[];
  hasMenu?: LdMenu | LdMenu[];
  hasMenuSection?: LdMenuSection[];
}

interface LdMenu {
  '@type'?: string;
  hasMenuSection?: LdMenuSection[];
}

interface ParsedMenuItem extends MenuItem {
  productId?: string;
}

interface WooVariation {
  attributes?: Record<string, string>;
  display_price?: number;
  is_in_stock?: boolean;
  variation_is_visible?: boolean;
}

/**
 * Abstract scraper for restaurants hosted on the FoodButik ordering platform
 * (food-butik WordPress plugin). Pages embed a schema.org Menu (ld+json) with
 * aggregate low/high prices; the per-product variants are loaded on demand
 * through the platform's product modal AJAX action.
 *
 * Concrete restaurants only provide id, name and their menu URL.
 */
export abstract class FoodButikScraper extends RestaurantScraper {
  protected async parseMenu(html: string, _url: string): Promise<MenuSection[]> {
    const menu = this.findMenu(html);
    const sections: { name: string; items: ParsedMenuItem[] }[] = (menu.hasMenuSection ?? [])
      .map((section) => ({
        name: section.name?.trim() || 'Menu',
        items: (section.hasMenuItem ?? [])
          .filter((item) => Boolean(item.name))
          .map((item) => ({
            name: item.name!.trim(),
            price: toPrice(item.offers),
            description: item.description?.trim() || undefined,
            productId: item.url?.match(/#produkt-(\d+)/)?.[1],
          })),
      }))
      .filter((section) => section.items.length > 0);

    if (sections.length === 0) {
      throw new Error('Unexpected menu payload: menu sections missing');
    }

    const pending = sections
      .flatMap((section) => section.items)
      .filter((item) => item.price?.kind === 'range' && item.productId !== undefined);

    await eachWithConcurrency(pending, 6, async (item) => {
      const price = await this.fetchVariationPrice(item.productId!);
      if (price) item.price = price;
    });

    return sections.map(({ name, items }) => ({
      name,
      items: items.map(({ productId: _productId, ...item }) => item),
    }));
  }

  private async fetchVariationPrice(productId: string): Promise<MenuPrice | undefined> {
    const body = new URLSearchParams({
      action: 'exwoofood_booking_info',
      id_food: productId,
      id_crsc: '',
      cart_itemkey: '',
      param_shortcode: '{"style":"2"}',
    });

    try {
      const response = await fetch(new URL('/wp-admin/admin-ajax.php', this.homeUrl), {
        method: 'POST',
        headers: {
          'User-Agent': 'EatIT/1.0 (menu scraper)',
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'text/html',
        },
        body,
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) return undefined;
      return parseVariationPrice(await response.text(), (text) => this.decodeEntities(text));
    } catch {
      return undefined;
    }
  }

  private findMenu(html: string): LdMenu {
    const blocks = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);

    for (const [, block] of blocks) {
      let parsed: { '@graph'?: LdNode[] } | undefined;
      try {
        parsed = JSON.parse(block);
      } catch {
        continue;
      }
      if (!parsed) continue;

      for (const node of parsed['@graph'] ?? []) {
        const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        if (!types.includes('Restaurant') || !node.hasMenu) continue;

        const menu = Array.isArray(node.hasMenu) ? node.hasMenu[0] : node.hasMenu;
        if (menu?.hasMenuSection) return menu;
      }
    }

    throw new Error('Could not find menu structured data (ld+json) in page');
  }
}

function toPrice(offers?: LdOffer): MenuPrice | undefined {
  const { price, lowPrice, highPrice } = offers ?? {};
  if (typeof lowPrice === 'number') {
    if (typeof highPrice === 'number' && highPrice !== lowPrice) {
      return { kind: 'range', min: lowPrice, max: highPrice };
    }
    return { kind: 'single', amount: lowPrice };
  }
  if (typeof price === 'number') {
    return { kind: 'single', amount: price };
  }
  return undefined;
}

function parseVariationPrice(
  html: string,
  decode: (text: string) => string
): MenuPrice | undefined {
  const raw = html.match(/data-product_variations="([^"]*)"/)?.[1];
  if (!raw) return undefined;

  let variations: WooVariation[];
  try {
    variations = JSON.parse(decode(raw)) as WooVariation[];
  } catch {
    return undefined;
  }
  if (!Array.isArray(variations)) return undefined;

  const labels = collectVariationLabels(html, decode);
  const options = variations
    .filter(
      (variation) =>
        variation.variation_is_visible !== false &&
        variation.is_in_stock !== false &&
        typeof variation.display_price === 'number'
    )
    .map((variation) => ({
      label: variationLabel(variation.attributes, labels),
      amount: variation.display_price!,
    }))
    .sort((a, b) => a.amount - b.amount);

  if (options.length === 0) return undefined;
  if (options.length === 1) return { kind: 'single', amount: options[0].amount };
  return { kind: 'options', options };
}

function collectVariationLabels(
  html: string,
  decode: (text: string) => string
): Map<string, string> {
  const labels = new Map<string, string>();
  const selects = html.matchAll(/<select[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g);

  for (const [, name, options] of selects) {
    const values = options.matchAll(
      /<option[^>]*value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/g
    );
    for (const [, value, text] of values) {
      const label = decode(text.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
      if (value && label && !/^välj\b/i.test(label)) {
        labels.set(`${name}:${decode(value)}`, label);
      }
    }
  }

  return labels;
}

function variationLabel(
  attributes: Record<string, string> | undefined,
  labels: Map<string, string>
): string | undefined {
  const parts = Object.entries(attributes ?? {})
    .map(([name, value]) => labels.get(`${name}:${value}`) ?? value)
    .filter((part) => part.length > 0);

  return parts.length > 0 ? parts.join(' · ') : undefined;
}

async function eachWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let next = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
    }
  });

  await Promise.all(workers);
}
