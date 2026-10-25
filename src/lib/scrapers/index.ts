import { ScraperRegistry } from './base/registry';
import { createRestaurantScrapers } from './restaurants';

export { RestaurantScraper, enforceIngredientsRule } from './base/scraper';
export { ScraperRegistry } from './base/registry';
export { OrdineScraper } from './platforms/ordine';

export const scraperRegistry = new ScraperRegistry();

for (const scraper of createRestaurantScrapers()) {
  scraperRegistry.register(scraper);
}
