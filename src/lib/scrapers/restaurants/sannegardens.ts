import { MenuPrice, MenuSection } from '@/types/menu';
import { RestaurantScraper } from '../base/scraper';

interface LdOffer {
  price?: number;
  lowPrice?: number;
  highPrice?: number;
}

interface LdMenuItem {
  name?: string;
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

/**
 * Sannegårdens embeds a schema.org Menu (ld+json) on the ordering page:
 * Restaurant > hasMenu > hasMenuSection > hasMenuItem with aggregate
 * low/high prices in SEK.
 */
export class SannegardensScraper extends RestaurantScraper {
  readonly id = 'sannegardens';
  readonly name = 'Sannegårdens Pizzeria';
  readonly homeUrl = 'https://sannegardens.se/bestalla-online/johanneberg/';

  protected parseMenu(html: string, _url: string): MenuSection[] {
    const menu = this.findMenu(html);
    const sections = (menu.hasMenuSection ?? [])
      .map((section) => ({
        name: section.name?.trim() || 'Menu',
        items: (section.hasMenuItem ?? [])
          .filter((item) => Boolean(item.name))
          .map((item) => ({
            name: item.name!.trim(),
            price: toPrice(item.offers),
            description: item.description?.trim() || undefined,
          })),
      }))
      .filter((section) => section.items.length > 0);

    if (sections.length === 0) {
      throw new Error('Unexpected menu payload: menu sections missing');
    }

    return sections;
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

/** Single price, a low/high range, or a plain schema.org Offer price */
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
