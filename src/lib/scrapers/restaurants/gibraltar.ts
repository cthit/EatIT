import { FoodButikScraper } from '../platforms/foodbutik';

/** Pizzeria Gibraltar runs on the FoodButik ordering platform. */
export class GibraltarScraper extends FoodButikScraper {
  readonly id = 'gibraltar';
  readonly name = 'Pizzeria Gibraltar';
  readonly homeUrl = 'https://gibraltarpizzeria.se/bestalla-online/';
}
