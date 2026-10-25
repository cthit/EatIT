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

/** Compact variant for tight spaces: options collapse to "from" their cheapest */
export function formatPriceShort(price: MenuPrice): string {
  if (price.kind !== 'options') return formatPrice(price);
  const min = Math.min(...price.options.map((option) => option.amount));
  return `from ${min} kr`;
}
