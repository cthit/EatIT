import OrderPageClient from '@/components/OrderPageClient';
import { getOrderWithItems } from '@/lib/storage';
import { menuBrowser } from '@/lib/menu-browser';
import { notFound } from 'next/navigation';
import { cache } from 'react';

// Deduplicates the query between the page and generateMetadata
const getOrder = cache(getOrderWithItems);

export const dynamic = 'force-dynamic';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id: hash } = await params;

  // Fetch initial data on the server
  const [{ order, items }, restaurants] = await Promise.all([
    getOrder(hash),
    menuBrowser.listRestaurants(),
  ]);

  // If order doesn't exist, return 404
  if (!order) {
    notFound();
  }

  return (
    <OrderPageClient
      hash={hash}
      initialOrder={order}
      initialOrderItems={items}
      restaurants={restaurants}
    />
  );
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { id: hash } = await params;
  const { order } = await getOrder(hash);

  return {
    title: order ? `EatIT Order - ${hash}` : 'Order Not Found',
    description: order ? `Food ordering session for ${order.restaurant?.restaurantName || 'restaurant'}` : 'Order not found',
  };
}
