import { MenuPrice } from '@/types/menu';

export function formatPrice(price: MenuPrice): string {
  switch (price.kind) {
    case 'single':
      return `${price.amount} kr`;
    case 'range':
      return `${price.min}–${price.max} kr`;
    case 'options':
      return price.options
        .map((option) => `${option.label ? `${option.label} ` : ''}${option.amount} kr`)
        .join(' / ');
  }
}

export function formatPriceShort(price: MenuPrice): string {
  switch (price.kind) {
    case 'single':
      return formatPrice(price);
    case 'range':
      return `from ${price.min} kr`;
    case 'options':
      return `from ${Math.min(...price.options.map((option) => option.amount))} kr`;
  }
}

export function describePrice(price: MenuPrice): string {
  switch (price.kind) {
    case 'single':
      return formatPrice(price);
    case 'range':
      return `Price varies by options: ${price.min}–${price.max} kr`;
    case 'options':
      return `Available options: ${formatPrice(price)}`;
  }
}
