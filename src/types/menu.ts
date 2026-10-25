export interface MenuItem {
  name: string;
  price?: string;
  description?: string;
  /** Present on every item of a menu, or on none of them */
  ingredients?: string[];
}

export interface MenuSection {
  name: string;
  items: MenuItem[];
}

export interface Menu {
  restaurantId: string;
  restaurantName: string;
  url: string;
  sections: MenuSection[];
  scrapedAt: number;
}

export interface RestaurantSummary {
  id: string;
  name: string;
  url: string;
  scrapedAt?: number;
  hasMenu: boolean;
}
