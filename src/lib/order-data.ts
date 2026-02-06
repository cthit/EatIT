import { getDb } from '@/lib/mongodb';
import { Order, OrderItem } from '@/types/order';

export async function getOrderByHash(hash: string): Promise<Order | null> {
  try {
    const db = await getDb();
    const orders = db.collection('orders');

    const order = await orders.findOne({ hash });

    if (!order) {
      return null;
    }

    return order as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function getOrderItemsByOrderHash(orderHash: string): Promise<OrderItem[]> {
  try {
    const db = await getDb();
    const orders = db.collection('orders');
    const orderItems = db.collection('order_items');

    // Find the order to get its _id
    const order = await orders.findOne({ hash: orderHash });

    if (!order) {
      return [];
    }

    const items = await orderItems
      .find({ order: order._id.toString() })
      .toArray();

    return items as OrderItem[];
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
}

export async function getOrderWithItems(hash: string): Promise<{
  order: Order | null;
  items: OrderItem[];
}> {
  const [order, items] = await Promise.all([
    getOrderByHash(hash),
    getOrderItemsByOrderHash(hash)
  ]);

  return { order, items };
}
