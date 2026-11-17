import { OrdineScraper } from '../platforms/ordine';

export class PeperoniScraper extends OrdineScraper {
  readonly id = 'peperoni-johanneberg';
  readonly name = 'Pizzeria Peperoni Johanneberg';
  readonly homeUrl = 'https://www.pizzeriapeperoni.se/api/r/pizzeria-peperoni-johanneberg';
}
