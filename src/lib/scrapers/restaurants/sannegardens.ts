import { FoodButikScraper } from '../platforms/foodbutik';

export class SannegardensScraper extends FoodButikScraper {
  readonly id = 'sannegardens';
  readonly name = 'Sannegårdens Pizzeria';
  readonly homeUrl = 'https://sannegardens.se/bestalla-online/johanneberg/';
}
