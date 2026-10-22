export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center text-center bg-black/85 rounded-2xl p-10 shadow-2xl">
        <h1 className="text-4xl font-bold mb-4 text-white">Order Not Found</h1>
        <p className="text-xl text-gray-200 mb-8">The order you&apos;re looking for doesn&apos;t exist or has expired.</p>
        <a
          href="/"
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Order
        </a>
      </div>
    </div>
  );
}