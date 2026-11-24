import Link from 'next/link';
import { homeButtonClass } from '@/components/ui';
import { NewOrderButton } from '@/components/NewOrderButton';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl p-10 shadow-2xl">
        <h1 className="text-6xl font-bold mb-6 text-gray-900">EatIT</h1>
        <p className="text-xl text-gray-600 mb-8">
          Organize food orders with your friends easily
        </p>

        <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
          <NewOrderButton />
          <Link
            href="/menus"
            className={`${homeButtonClass} text-center`}
          >
            See menus<br/>
            <span className="text-sm text-gray-200">
              Browse restaurants
            </span>
          </Link>
        </div>

        <p className="text-gray-500 mt-4 text-sm">
          Orders are automatically deleted after 24 hours
        </p>
      </div>
    </div>
  );
}
