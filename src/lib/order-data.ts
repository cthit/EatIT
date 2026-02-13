import { Order, OrderItem } from '@/types/order';
import { getOrderByHash as getOrder, getOrderItems as getItems, getOrderWithItems as getOrderAndItems } from '@/lib/storage';

export async function getOrderByHash(hash: string): Promise<Order | null> {
  try {
    return await getOrder(hash);
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function getOrderItemsByOrderHash(orderHash: string): Promise<OrderItem[]> {
  try {
    return await getItems(orderHash);
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
}

export async function getOrderWithItems(hash: string): Promise<{
  order: Order | null;
  items: OrderItem[];
}> {
  return await getOrderAndItems(hash);
}
