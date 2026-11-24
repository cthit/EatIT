import { QoplaScraper } from '../platforms/qopla';

export class GollyScraper extends QoplaScraper {
  readonly id = 'golly';
  readonly name = 'Golly - Gibraltargatan';
  readonly homeUrl =
    'https://gollypasta.qopla.com/v2/restaurant/golly---gibraltargatan/qomRz1JNOj/order/menu';
}
