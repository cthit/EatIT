import { DatabaseSync } from 'node:sqlite';
import { Menu, MenuPrice, MenuSection, RestaurantSummary } from '@/types/menu';
import { getDb } from '@/lib/db';
import { RestaurantScraper, ScraperRegistry, scraperRegistry, enforceIngredientsRule } from '@/lib/scrapers';

let schemaReady: Promise<void> | undefined;

async function getMenuDb(): Promise<DatabaseSync> {
  const db = await getDb();
  schemaReady ??= initSchema(db);
  await schemaReady;
  return db;
}

async function initSchema(db: DatabaseSync): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      scraped_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      restaurant_id TEXT NOT NULL,
      section TEXT NOT NULL,
      name TEXT NOT NULL,
      price TEXT,
      description TEXT,
      ingredients TEXT,
      position INTEGER NOT NULL,
      PRIMARY KEY (restaurant_id, position),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    );
  `);

  // Migration for databases created before the ingredients column existed
  const columns = db.prepare('PRAGMA table_info(menu_items)').all() as unknown as { name: string }[];
  if (!columns.some((column) => column.name === 'ingredients')) {
    db.exec('ALTER TABLE menu_items ADD COLUMN ingredients TEXT');
  }

  // Menus are a cache: drop entries stored before prices became structured JSON
  const legacyPrice = db
    .prepare("SELECT 1 FROM menu_items WHERE price IS NOT NULL AND price NOT LIKE '{%' LIMIT 1")
    .get();
  if (legacyPrice) {
    db.exec('DELETE FROM menu_items; DELETE FROM restaurants;');
  }
}

/**
 * Abstract browsing facade: list restaurants, load stored menus and trigger
 * scrapes. Persistence is provided by concrete implementations.
 */
export abstract class MenuBrowser {
  protected constructor(protected readonly registry: ScraperRegistry) {}

  /** All known restaurants, merged with stored scrape state */
  abstract listRestaurants(): Promise<RestaurantSummary[]>;

  /** Stored menu for a restaurant, or null if never scraped */
  abstract getMenu(restaurantId: string): Promise<Menu | null>;

  /** Persist a scraped menu, replacing any previous one */
  abstract saveMenu(menu: Menu): Promise<void>;

  getScraper(restaurantId: string): RestaurantScraper | undefined {
    return this.registry.byId(restaurantId);
  }

  getScraperForUrl(url: string): RestaurantScraper | undefined {
    return this.registry.find(url);
  }

  /** Scrape a registered restaurant's default menu URL and store the result */
  async scrapeRestaurant(restaurantId: string): Promise<Menu> {
    const scraper = this.getScraper(restaurantId);
    if (!scraper) {
      throw new Error(`No scraper registered for restaurant "${restaurantId}"`);
    }

    const menu = await scraper.scrape();
    await this.saveMenu(menu);
    return menu;
  }

  /** Scrape an arbitrary URL using the scraper that handles it, and store the result */
  async scrapeUrl(url: string): Promise<Menu> {
    const scraper = this.getScraperForUrl(url);
    if (!scraper) {
      throw new Error(`No scraper registered for ${url}`);
    }

    const menu = await scraper.scrape(url);
    await this.saveMenu(menu);
    return menu;
  }
}

interface RestaurantRow {
  id: string;
  name: string;
  url: string;
  scraped_at: number | null;
}

interface MenuItemRow {
  section: string;
  name: string;
  price: string | null;
  description: string | null;
  ingredients: string | null;
  position: number;
}

export class SqliteMenuBrowser extends MenuBrowser {
  constructor(registry: ScraperRegistry = scraperRegistry) {
    super(registry);
  }

  async listRestaurants(): Promise<RestaurantSummary[]> {
    const db = await getMenuDb();
    const rows = db
      .prepare('SELECT id, name, url, scraped_at FROM restaurants')
      .all() as unknown as RestaurantRow[];
    const stored = new Map(rows.map((row) => [row.id, row]));

    return this.registry.list().map((scraper) => {
      const row = stored.get(scraper.id);
      return {
        id: scraper.id,
        name: scraper.name,
        url: scraper.homeUrl,
        scrapedAt: row?.scraped_at ?? undefined,
        hasMenu: Boolean(row?.scraped_at),
      };
    });
  }

  async getMenu(restaurantId: string): Promise<Menu | null> {
    const db = await getMenuDb();

    const row = db
      .prepare('SELECT id, name, url, scraped_at FROM restaurants WHERE id = ?')
      .get(restaurantId) as unknown as RestaurantRow | undefined;
    if (!row) return null;

    const itemRows = db
      .prepare(
        'SELECT section, name, price, description, ingredients, position FROM menu_items WHERE restaurant_id = ? ORDER BY position ASC'
      )
      .all(restaurantId) as unknown as MenuItemRow[];
    if (itemRows.length === 0) return null;

    const sections: MenuSection[] = [];
    for (const item of itemRows) {
      let section = sections[sections.length - 1];
      if (!section || section.name !== item.section) {
        section = { name: item.section, items: [] };
        sections.push(section);
      }
      section.items.push({
        name: item.name,
        price: item.price ? (JSON.parse(item.price) as MenuPrice) : undefined,
        description: item.description ?? undefined,
        ingredients: item.ingredients ? (JSON.parse(item.ingredients) as string[]) : undefined,
      });
    }

    return {
      restaurantId: row.id,
      restaurantName: row.name,
      url: row.url,
      sections,
      scrapedAt: row.scraped_at ?? 0,
    };
  }

  async saveMenu(menu: Menu): Promise<void> {
    const db = await getMenuDb();
    const sections = enforceIngredientsRule(menu.sections);

    db.exec('BEGIN');
    try {
      db.prepare(
        `INSERT INTO restaurants (id, name, url, scraped_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           url = excluded.url,
           scraped_at = excluded.scraped_at`
      ).run(menu.restaurantId, menu.restaurantName, menu.url, menu.scrapedAt);

      db.prepare('DELETE FROM menu_items WHERE restaurant_id = ?').run(menu.restaurantId);

      const insert = db.prepare(
        `INSERT INTO menu_items (restaurant_id, section, name, price, description, ingredients, position)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      let position = 0;
      for (const section of sections) {
        for (const item of section.items) {
          insert.run(
            menu.restaurantId,
            section.name,
            item.name,
            item.price ? JSON.stringify(item.price) : null,
            item.description ?? null,
            item.ingredients ? JSON.stringify(item.ingredients) : null,
            position++
          );
        }
      }

      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}

export const menuBrowser = new SqliteMenuBrowser();
