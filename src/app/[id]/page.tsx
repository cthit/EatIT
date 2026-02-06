import OrderPageClient from '@/components/OrderPageClient';
import { getOrderWithItems } from '@/lib/order-data';
import { notFound } from 'next/navigation';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id: hash } = await params;

  // Fetch initial data on the server
  const { order, items } = await getOrderWithItems(hash);

  // If order doesn't exist, return 404
  if (!order) {
    notFound();
  }

  // Serialize MongoDB objects to plain JavaScript objects
  const serializedOrder = JSON.parse(JSON.stringify(order));
  const serializedItems = JSON.parse(JSON.stringify(items));

  return <OrderPageClient hash={hash} initialOrder={serializedOrder} initialOrderItems={serializedItems} />;
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { id: hash } = await params;
  const { order } = await getOrderWithItems(hash);

  return {
    title: order ? `EatIT Order - ${hash}` : 'Order Not Found',
    description: order ? `Food ordering session for ${order.restaurant?.restaurantName || 'restaurant'}` : 'Order not found',
  };
}
