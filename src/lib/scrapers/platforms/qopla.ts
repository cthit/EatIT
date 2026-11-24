import { MenuItem, MenuSection } from '@/types/menu';
import { RestaurantScraper } from '../base/scraper';

const QOPLA_GRAPHQL_URL = 'https://api.qopla.com/graphql';

const SHOP_QUERY = `query getShopByPublicIdForOnlineOrder($publicId: String!) {
  getShopByPublicIdForOnlineOrder(publicId: $publicId) {
    id
    settings {
      onlineSettings {
        onlineMenuIds
      }
    }
  }
}`;

const MENUS_QUERY = `query getMenusByIdsForOnlineOrder($menuIds: [String], $shopId: String!) {
  getMenusByIdsForOnlineOrder(menuIds: $menuIds, shopId: $shopId) {
    id
    name
    disabled
    deleted
    sortOrder
    menuProductCategories {
      id
      name
      sortOrder
      menuProducts {
        id
        price
        sortOrder
        refProduct {
          id
          name
          description
          defaultPrice
        }
      }
      menuBundleProducts {
        id
        price
        sortOrder
        refBundleProduct {
          id
          name
          description
          defaultPrice
        }
      }
    }
  }
}`;

interface QoplaShop {
  id?: string;
  settings?: {
    onlineSettings?: {
      onlineMenuIds?: (string | null)[] | null;
    } | null;
  } | null;
}

interface QoplaRefProduct {
  id?: string;
  name?: string | null;
  description?: string | null;
  defaultPrice?: number | null;
}

interface QoplaProduct {
  price?: number | null;
  sortOrder?: number | null;
  refProduct?: QoplaRefProduct | null;
}

interface QoplaBundleProduct {
  price?: number | null;
  sortOrder?: number | null;
  refBundleProduct?: QoplaRefProduct | null;
}

interface QoplaCategory {
  name?: string | null;
  sortOrder?: number | null;
  menuProducts?: (QoplaProduct | null)[] | null;
  menuBundleProducts?: (QoplaBundleProduct | null)[] | null;
}

interface QoplaMenu {
  name?: string | null;
  disabled?: boolean | null;
  deleted?: boolean | null;
  sortOrder?: number | null;
  menuProductCategories?: (QoplaCategory | null)[] | null;
}

/**
 * Abstract scraper for restaurants hosted on the Qopla ordering platform.
 * The menu page is a Next.js app that reads its data from Qopla's GraphQL
 * API, so the scraper resolves the shop's public ID from the page URL and
 * fetches the active menu directly from the API.
 *
 * Concrete restaurants only provide id, name and their menu URL.
 */
export abstract class QoplaScraper extends RestaurantScraper {
  protected override async fetchHtml(url: string = this.homeUrl): Promise<string> {
    const publicId = publicIdFromUrl(url);

    const shopData = await this.query<{ getShopByPublicIdForOnlineOrder?: QoplaShop | null }>(
      SHOP_QUERY,
      { publicId }
    );
    const shop = shopData.getShopByPublicIdForOnlineOrder;
    if (!shop?.id) {
      throw new Error(`Could not find Qopla shop for public ID ${publicId}`);
    }

    const menuIds = (shop.settings?.onlineSettings?.onlineMenuIds ?? []).filter(
      (id): id is string => typeof id === 'string' && id.length > 0
    );
    if (menuIds.length === 0) {
      throw new Error(`Qopla shop ${publicId} has no online menus`);
    }

    const menuData = await this.query<{ getMenusByIdsForOnlineOrder?: (QoplaMenu | null)[] | null }>(
      MENUS_QUERY,
      { shopId: shop.id, menuIds }
    );

    return JSON.stringify(menuData.getMenusByIdsForOnlineOrder ?? []);
  }

  protected parseMenu(html: string, _url: string): MenuSection[] {
    const menus = JSON.parse(html) as (QoplaMenu | null)[];
    const menu = menus
      .filter((entry): entry is QoplaMenu => Boolean(entry))
      .filter((entry) => !entry.disabled && !entry.deleted)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];

    if (!menu) {
      throw new Error('Unexpected menu payload: no active menu');
    }

    const sections = (menu.menuProductCategories ?? [])
      .filter((category): category is QoplaCategory => Boolean(category))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((category) => {
        const products = (category.menuProducts ?? []).map((product) => ({
          sortOrder: product?.sortOrder ?? 0,
          item: toItem(product?.refProduct, product?.price),
        }));
        const bundles = (category.menuBundleProducts ?? []).map((product) => ({
          sortOrder: product?.sortOrder ?? 0,
          item: toItem(product?.refBundleProduct, product?.price),
        }));

        const items = [...products, ...bundles]
          .filter((entry): entry is { sortOrder: number; item: MenuItem } => Boolean(entry.item))
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((entry) => entry.item);

        return { name: category.name?.trim() || 'Menu', items };
      })
      .filter((section) => section.items.length > 0);

    if (sections.length === 0) {
      throw new Error('Unexpected menu payload: menu sections missing');
    }

    return dedupeItems(sections);
  }

  private async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await fetch(QOPLA_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'EatIT/1.0 (menu scraper)',
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Qopla API request failed (HTTP ${response.status})`);
    }

    const payload = (await response.json()) as {
      data?: T;
      errors?: { message?: string }[];
    };

    if (payload.errors?.length) {
      throw new Error(`Qopla API error: ${payload.errors[0]?.message ?? 'unknown error'}`);
    }
    if (!payload.data) {
      throw new Error('Qopla API returned no data');
    }

    return payload.data;
  }
}

/** Qopla URLs look like /v2/restaurant/<name>/<publicId>/order/menu */
function publicIdFromUrl(url: string): string {
  const match = new URL(url).pathname.match(/\/restaurant\/[^/]+\/([^/]+)/);
  if (!match) {
    throw new Error(`Could not determine Qopla public ID from URL: ${url}`);
  }
  return decodeURIComponent(match[1]);
}

/**
 * Qopla menus can repeat products in checkout-only categories. Drop items
 * that already appeared earlier so such categories do not duplicate the menu.
 */
function dedupeItems(sections: MenuSection[]): MenuSection[] {
  const seen = new Set<string>();
  const result: MenuSection[] = [];

  for (const section of sections) {
    const items = section.items.filter((item) => {
      const key = `${item.name}\u0000${item.price ? JSON.stringify(item.price) : ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (items.length > 0) result.push({ ...section, items });
  }

  return result;
}

function toItem(
  ref: QoplaRefProduct | null | undefined,
  overridePrice: number | null | undefined
): MenuItem | undefined {
  const name = ref?.name?.trim();
  if (!name) return undefined;

  const amount = typeof overridePrice === 'number' ? overridePrice : ref?.defaultPrice;

  return {
    name,
    description: ref?.description?.trim() || undefined,
    price: typeof amount === 'number' ? { kind: 'single', amount } : undefined,
  };
}
