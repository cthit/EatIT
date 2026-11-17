import { MenuPrice } from '@/types/menu';

/** The one place prices are turned into display strings */
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

/** Compact variant for tight spaces: anything with variants collapses to its cheapest */
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

/** Longer explanation for tooltips and accessible labels */
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
