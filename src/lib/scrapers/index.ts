import { ScraperRegistry } from './base/registry';
import { createRestaurantScrapers } from './restaurants';

export { RestaurantScraper } from './base/scraper';
export { ScraperRegistry } from './base/registry';
export { OrdineScraper } from './platforms/ordine';
export { FoodButikScraper } from './platforms/foodbutik';
export { QoplaScraper } from './platforms/qopla';

export const scraperRegistry = new ScraperRegistry();

for (const scraper of createRestaurantScrapers()) {
  scraperRegistry.register(scraper);
}
