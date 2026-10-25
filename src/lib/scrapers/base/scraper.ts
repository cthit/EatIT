import { Menu, MenuItem, MenuSection } from '@/types/menu';

const PRICE_PATTERN =
  /(?:€|£|\$|kr|SEK|:-)\s*\d+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?\s*(?:€|£|\$|kr|SEK|:-)/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  aring: 'å',
  auml: 'ä',
  ouml: 'ö',
  Aring: 'Å',
  Auml: 'Ä',
  Ouml: 'Ö',
  eacute: 'é',
  uuml: 'ü',
};

/**
 * Enforce the all-or-nothing ingredients rule: a menu either lists
 * ingredients for every item or for none. Menus where at least one item
 * lacks ingredients have all ingredients stripped.
 */
export function enforceIngredientsRule(sections: MenuSection[]): MenuSection[] {
  const items = sections.flatMap((section) => section.items);
  const allHaveIngredients =
    items.length > 0 && items.every((item) => (item.ingredients?.length ?? 0) > 0);

  if (allHaveIngredients) return sections;

  return sections.map((section) => ({
    ...section,
    items: section.items.map(({ ingredients: _ingredients, ...item }) => item),
  }));
}

/**
 * Abstract base for restaurant menu scrapers. Each restaurant implements
 * {@link parseMenu} with site-specific parsing, while fetching, error
 * handling and generic HTML-to-menu heuristics live here.
 */
export abstract class RestaurantScraper {
  /** Stable identifier used in URLs and storage */
  abstract readonly id: string;
  /** Display name of the restaurant */
  abstract readonly name: string;
  /** Default menu URL for this restaurant */
  abstract readonly homeUrl: string;

  /** Whether this scraper is responsible for the given menu URL */
  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.replace(/^www\./, '') ===
        new URL(this.homeUrl).hostname.replace(/^www\./, '');
    } catch {
      return false;
    }
  }

  /** Fetch and parse the restaurant's menu */
  async scrape(url: string = this.homeUrl): Promise<Menu> {
    const sections: MenuSection[] = [];
    for (const menuUrl of this.menuUrls(url)) {
      sections.push(...this.parseMenu(await this.fetchHtml(menuUrl), menuUrl));
    }

    return {
      restaurantId: this.id,
      restaurantName: this.name,
      url,
      sections: enforceIngredientsRule(sections),
      scrapedAt: Date.now(),
    };
  }

  /**
   * All URLs that together make up the restaurant's menu.
   * Override for restaurants that split their menu across pages.
   */
  protected menuUrls(url: string): string[] {
    return [url];
  }

  /** Extract menu sections from the fetched HTML */
  protected abstract parseMenu(html: string, url: string): MenuSection[];

  protected async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EatIT/1.0 (menu scraper)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url} (HTTP ${response.status})`);
    }

    return await response.text();
  }

  /** Decode common HTML entities */
  protected decodeEntities(text: string): string {
    return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      if (entity.startsWith('#x') || entity.startsWith('#X')) {
        const code = parseInt(entity.slice(2), 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      if (entity.startsWith('#')) {
        const code = parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      return NAMED_ENTITIES[entity] ?? NAMED_ENTITIES[entity.toLowerCase()] ?? ' ';
    });
  }

  /** Remove scripts/styles/tags and decode common entities, one block of text per line */
  protected stripTags(html: string): string {
    return this.decodeEntities(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, '\n')
    ).replace(/\r/g, '');
  }

  /**
   * Generic heuristic menu extractor: lines containing a price become items,
   * short price-free lines become section headings. Text in parentheses
   * after an item name is treated as ingredients.
   */
  protected extractSections(text: string): MenuSection[] {
    const sections: MenuSection[] = [];
    let current: MenuSection = { name: 'Menu', items: [] };

    const pushCurrent = () => {
      if (current.items.length > 0) sections.push(current);
    };

    for (const rawLine of text.split('\n')) {
      const line = rawLine.replace(/\s+/g, ' ').trim();
      if (line.length < 2 || line.length > 120 || /^(?:cookie|menu|home|contact|about)$/i.test(line)) {
        continue;
      }

      const priceMatch = line.match(PRICE_PATTERN);
      if (priceMatch) {
        const price = priceMatch[0].trim();
        let name = line
          .replace(PRICE_PATTERN, '')
          .replace(/[\s:·|.,\-–]+$/, '')
          .replace(/^[\s:·|.,\-–]+/, '')
          .trim();

        let ingredients: string[] | undefined;
        const parenMatch = name.match(/\(([^)]+)\)/);
        if (parenMatch) {
          const parts = parenMatch[1]
            .split(/[,/&]+/)
            .map((part) => part.trim())
            .filter((part) => part.length > 0 && part.length <= 50);
          if (parts.length > 0) ingredients = parts;
          name = name.replace(/\s*\([^)]+\)/, '').trim();
        }

        if (isPlausibleItemName(name)) {
          current.items.push(ingredients ? { name, price, ingredients } : { name, price });
        }
        continue;
      }

      if (isSectionHeading(line)) {
        if (current.items.length > 0) {
          pushCurrent();
          current = { name: line, items: [] };
        } else if (current.name === 'Menu') {
          current.name = line;
        }
      }
    }

    pushCurrent();
    return sections;
  }
}

function isPlausibleItemName(name: string): boolean {
  return (
    name.length >= 2 &&
    name.length <= 100 &&
    /[a-zA-ZåäöÅÄÖé]/.test(name) &&
    !/^(?:price|pris|total|summa|se|mer|see)$/i.test(name)
  );
}

function isSectionHeading(line: string): boolean {
  if (line.length > 40 || /\d/.test(line) || /[.,;:!?]$/.test(line)) return false;
  if (!/^[a-zA-ZåäöÅÄÖéÉ\s&/]+$/.test(line)) return false;

  const letters = line.replace(/[^a-zA-ZåäöÅÄÖéÉ]/g, '').split('');
  if (letters.length < 3) return false;

  const upper = letters.filter((c) => c === c.toUpperCase()).length;
  const words = line.split(/\s+/);
  const titleCase = words.every((w) => /^[A-ZÅÄÖÉ]/.test(w) || w.length <= 2);

  return upper / letters.length >= 0.6 || titleCase;
}
