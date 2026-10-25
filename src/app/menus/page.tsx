import type { Metadata } from 'next';
import { MenuBrowser } from '@/components/MenuBrowser';

export const metadata: Metadata = {
  title: 'Menus - EatIT',
  description: 'Browse restaurant menus',
};

export default function MenusPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">Restaurant menus</h1>
      <MenuBrowser canSelectItems={false} />
    </div>
  );
}
