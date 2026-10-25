import { MenuItem, MenuPrice, MenuSection } from '@/types/menu';
import { RestaurantScraper, parseAmount } from '../base/scraper';

const MENU_PAGES = [
  'https://pizzeriagibraltar.com/',
  'https://pizzeriagibraltar.com/kebaber/',
  'https://pizzeriagibraltar.com/sallader/',
  'https://pizzeriagibraltar.com/pasta/',
];

/**
 * Pizzeria Gibraltar splits its menu across four static WordPress pages,
 * each containing a cltable table: cltitle = section heading, and per item
 * a clname / clprc (one or more prcitem spans) / clingr row.
 */
export class GibraltarScraper extends RestaurantScraper {
  readonly id = 'gibraltar';
  readonly name = 'Pizzeria Gibraltar';
  readonly homeUrl = MENU_PAGES[0];

  protected override menuUrls(): string[] {
    return [...MENU_PAGES];
  }

  protected parseMenu(html: string, _url: string): MenuSection[] {
    const content = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    const cells = content.matchAll(/<td[^>]*class="(cltitle|clname|clprc|clingr)"[^>]*>([\s\S]*?)<\/td>/g);

    const sections: MenuSection[] = [];
    let current: MenuSection | null = null;
    let pending: MenuItem | null = null;

    const flushPending = () => {
      if (pending && current) current.items.push(pending);
      pending = null;
    };

    for (const [, cellClass, raw] of cells) {
      if (cellClass === 'cltitle') {
        flushPending();
        current = { name: this.decodeEntities(raw).replace(/\s+/g, ' ').trim(), items: [] };
        sections.push(current);
        continue;
      }

      if (cellClass === 'clname') {
        flushPending();
        pending = { name: this.decodeEntities(raw).replace(/\s+/g, ' ').trim() };
        continue;
      }

      if (cellClass === 'clprc' && pending) {
        const amounts = [...raw.matchAll(/class="prcitem"[^>]*>([^<]*)</g)]
          .map((match) => parseAmount(match[1]))
          .filter((amount): amount is number => amount !== undefined);
        pending.price = toPrice(amounts);
        continue;
      }

      if (cellClass === 'clingr' && pending && current) {
        const description = this.decodeEntities(raw).replace(/\s+/g, ' ').trim();
        current.items.push({
          ...pending,
          description: description || undefined,
        });
        pending = null;
      }
    }

    flushPending();
    return sections.filter((section) => section.items.length > 0);
  }
}

function toPrice(amounts: number[]): MenuPrice | undefined {
  if (amounts.length === 0) return undefined;
  if (amounts.length === 1) return { kind: 'single', amount: amounts[0] };
  return { kind: 'options', options: amounts.map((amount) => ({ amount })) };
}
