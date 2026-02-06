export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Order Not Found</h1>
      <p className="text-xl text-gray-600 mb-8">The order you&apos;re looking for doesn&apos;t exist or has expired.</p>
      <a
        href="/"
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create New Order
      </a>
    </div>
  );
}