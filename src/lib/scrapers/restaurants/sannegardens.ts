import { FoodButikScraper } from '../platforms/foodbutik';

/** Sannegårdens runs on the FoodButik ordering platform. */
export class SannegardensScraper extends FoodButikScraper {
  readonly id = 'sannegardens';
  readonly name = 'Sannegårdens Pizzeria';
  readonly homeUrl = 'https://sannegardens.se/bestalla-online/johanneberg/';
}
