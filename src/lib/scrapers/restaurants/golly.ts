import { QoplaScraper } from '../platforms/qopla';

/** Golly runs on the Qopla ordering platform. */
export class GollyScraper extends QoplaScraper {
  readonly id = 'golly';
  readonly name = 'Golly - Gibraltargatan';
  readonly homeUrl =
    'https://gollypasta.qopla.com/v2/restaurant/golly---gibraltargatan/qomRz1JNOj/order/menu';
}
