import { RestaurantScraper } from '../base/scraper';
import { SannegardensScraper } from './sannegardens';
import { GibraltarScraper } from './gibraltar';
import { DominosScraper } from './dominos';
import { PeperoniScraper } from './peperoni';

export { SannegardensScraper } from './sannegardens';
export { GibraltarScraper } from './gibraltar';
export { DominosScraper } from './dominos';
export { PeperoniScraper } from './peperoni';

/** All concrete restaurant scrapers that are registered by default */
export function createRestaurantScrapers(): RestaurantScraper[] {
  return [
    new SannegardensScraper(),
    new GibraltarScraper(),
    new DominosScraper(),
    new PeperoniScraper(),
  ];
}
