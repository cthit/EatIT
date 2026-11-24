import { RestaurantScraper } from '../base/scraper';
import { SannegardensScraper } from './sannegardens';
import { GibraltarScraper } from './gibraltar';
import { DominosScraper } from './dominos';
import { PeperoniScraper } from './peperoni';
import { GollyScraper } from './golly';

export { SannegardensScraper } from './sannegardens';
export { GibraltarScraper } from './gibraltar';
export { DominosScraper } from './dominos';
export { PeperoniScraper } from './peperoni';
export { GollyScraper } from './golly';

export function createRestaurantScrapers(): RestaurantScraper[] {
  return [
    new SannegardensScraper(),
    new GibraltarScraper(),
    new DominosScraper(),
    new PeperoniScraper(),
    new GollyScraper(),
  ];
}
