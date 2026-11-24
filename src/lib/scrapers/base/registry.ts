import { RestaurantScraper } from './scraper';

export class ScraperRegistry {
  private readonly scrapers: RestaurantScraper[] = [];

  register(scraper: RestaurantScraper): this {
    this.scrapers.push(scraper);
    return this;
  }

  list(): RestaurantScraper[] {
    return [...this.scrapers];
  }

  byId(id: string): RestaurantScraper | undefined {
    return this.scrapers.find((scraper) => scraper.id === id);
  }

  find(url: string): RestaurantScraper | undefined {
    return this.scrapers.find((scraper) => scraper.canHandle(url));
  }
}
