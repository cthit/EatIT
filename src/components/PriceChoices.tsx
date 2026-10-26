import { MenuPrice } from '@/types/menu';

export function PriceChoices({ price }: { price: MenuPrice }) {
  if (price.kind !== 'options') return null;

  return (
    <ul className="mt-1 mb-1 space-y-1 text-xs text-gray-600">
      {price.options.map((option, index) => (
        <li key={index} className="flex justify-between gap-8 w-full max-w-xs">
          <span>{option.label}</span>
          <span className="text-gray-500 whitespace-nowrap">{option.amount} kr</span>
        </li>
      ))}
    </ul>
  );
}
