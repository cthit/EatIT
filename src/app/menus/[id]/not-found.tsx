import Link from 'next/link';

export default function MenuNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
      <h1 className="text-4xl font-bold mb-4 text-white">Restaurant not found</h1>
      <p className="text-gray-300 mb-8">
        It may have been removed from the list of supported restaurants.
      </p>
      <Link
        href="/menus"
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Back to menus
      </Link>
    </div>
  );
}
