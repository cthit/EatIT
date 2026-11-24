import { MenuPrice, MenuSection } from '@/types/menu';
import { RestaurantScraper } from '../base/scraper';

interface LocaleString {
  sv?: string;
  en?: string;
}

interface DominoVariation {
  size?: string;
  price?: number;
}

interface DominoProduct {
  name?: LocaleString;
  description?: LocaleString | null;
  category?: string;
  categories?: string[];
  order?: number;
  ingredients?: { name?: LocaleString }[] | null;
  variations?: DominoVariation[] | null;
}

interface DominoPageProps {
  products?: DominoProduct[];
}

/**
 * Domino's menus are Next.js pages with the full product list embedded
 * in the __NEXT_DATA__ script tag, including per-product ingredients and
 * price variations for each pizza size.
 */
export class DominosScraper extends RestaurantScraper {
  readonly id = 'dominos';
  readonly name = 'Dominos';
  readonly homeUrl = 'https://www.dominos.se/butiker/johanneberg/meny/pizza';

  protected parseMenu(html: string, _url: string): MenuSection[] {
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
    );
    if (!match) {
      throw new Error('Could not find __NEXT_DATA__ in page');
    }

    const pageProps = JSON.parse(match[1])?.props?.pageProps as DominoPageProps | undefined;
    const products = pageProps?.products;
    if (!Array.isArray(products)) {
      throw new Error('Unexpected menu payload: products missing');
    }

    const sections: MenuSection[] = [];
    const sectionByName = new Map<string, MenuSection>();

    const sorted = [...products].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const product of sorted) {
      const name = product.name?.sv?.trim();
      if (!name) continue;

      const sectionName = product.categories?.[0] ?? product.category ?? 'Menu';
      let section = sectionByName.get(sectionName);
      if (!section) {
        section = { name: sectionName, items: [] };
        sectionByName.set(sectionName, section);
        sections.push(section);
      }

      const ingredients = (product.ingredients ?? [])
        .map((ingredient) => ingredient.name?.sv?.trim())
        .filter((ingredient): ingredient is string => Boolean(ingredient));

      section.items.push({
        name,
        price: toPrice(product.variations ?? []),
        description: product.description?.sv?.trim() || undefined,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
      });
    }

    return sections.filter((section) => section.items.length > 0);
  }
}

/** One option per pizza size (cheapest channel), labeled with the diameter */
function toPrice(variations: DominoVariation[]): MenuPrice | undefined {
  const bySize = new Map<string, { label?: string; amount: number; diameter: number }>();

  for (const { size, price } of variations) {
    if (!size || typeof price !== 'number') continue;

    const current = bySize.get(size);
    if (!current || price < current.amount) {
      const diameter = Number(/(\d+)/.exec(size)?.[1] ?? Number.MAX_SAFE_INTEGER);
      bySize.set(size, {
        label: Number.isFinite(diameter) ? `${diameter} cm` : undefined,
        amount: price,
        diameter,
      });
    }
  }

  const options = [...bySize.values()].sort((a, b) => a.diameter - b.diameter);
  if (options.length === 0) return undefined;
  if (options.length === 1) return { kind: 'single', amount: options[0].amount };
  return {
    kind: 'options',
    options: options.map(({ label, amount }) => ({ label, amount })),
  };
}
