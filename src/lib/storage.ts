import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { promises as fs } from 'fs';
import { Order, OrderItem } from '@/types/order';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'eatit.db');
const SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

let db: DatabaseSync | null = null;

// Initialize database
async function getDb(): Promise<DatabaseSync> {
  if (db) return db;

  // Ensure data directory exists
  await fs.mkdir(DATA_DIR, { recursive: true });

  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL'); // Better concurrency

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      hash TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      last_modified INTEGER NOT NULL,
      timer_end INTEGER,
      play_eat_it_song INTEGER DEFAULT 0,
      swish_nbr TEXT,
      swish_name TEXT,
      restaurant_name TEXT,
      restaurant_link TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_hash TEXT NOT NULL,
      nick TEXT NOT NULL,
      pizza TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (order_hash) REFERENCES orders(hash) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order_hash ON order_items(order_hash);
    CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);
  `);

  return db;
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const database = await getDb();
    const now = Date.now();
    
    // Delete expired orders (cascades to order_items)
    const stmt = database.prepare('DELETE FROM orders WHERE expires_at < ?');
    const result = stmt.run(now);
    
    if (result.changes > 0) {
      console.log(`Cleaned up ${result.changes} expired sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}

// Create a new order
export async function createOrder(hash: string): Promise<Order> {
  const database = await getDb();
  const now = Date.now();
  const expiresAt = now + SESSION_LIFETIME_MS;

  const stmt = database.prepare(`
    INSERT INTO orders (hash, created_at, expires_at, last_modified)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(hash, now, expiresAt, now);

  return {
    _id: hash,
    hash,
    createdAt: new Date(now).toISOString(),
  };
}

// Get order by hash
export async function getOrderByHash(hash: string): Promise<Order | null> {
  const database = await getDb();
  const now = Date.now();

  const stmt = database.prepare(`
    SELECT * FROM orders WHERE hash = ? AND expires_at > ?
  `);
  
  const row = stmt.get(hash, now) as any;
  
  if (!row) return null;

  return {
    _id: row.hash,
    hash: row.hash,
    createdAt: new Date(row.created_at).toISOString(),
    timer_end: row.timer_end || undefined,
    playEatITSong: row.play_eat_it_song === 1,
    swishNbr: row.swish_nbr || undefined,
    swishName: row.swish_name || undefined,
    restaurant: row.restaurant_name ? {
      restaurantName: row.restaurant_name,
      linkToMenu: row.restaurant_link || '',
    } : undefined,
  };
}

// Update order
export async function updateOrder(hash: string, updates: Partial<Order>): Promise<Order | null> {
  const database = await getDb();
  const now = Date.now();

  // Check if order exists and not expired
  const exists = database.prepare('SELECT 1 FROM orders WHERE hash = ? AND expires_at > ?').get(hash, now);
  if (!exists) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.timer_end !== undefined) {
    fields.push('timer_end = ?');
    values.push(updates.timer_end);
  }
  if (updates.playEatITSong !== undefined) {
    fields.push('play_eat_it_song = ?');
    values.push(updates.playEatITSong ? 1 : 0);
  }
  if (updates.swishNbr !== undefined) {
    fields.push('swish_nbr = ?');
    values.push(updates.swishNbr);
  }
  if (updates.swishName !== undefined) {
    fields.push('swish_name = ?');
    values.push(updates.swishName);
  }
  if (updates.restaurant) {
    fields.push('restaurant_name = ?', 'restaurant_link = ?');
    values.push(updates.restaurant.restaurantName, updates.restaurant.linkToMenu);
  }

  if (fields.length > 0) {
    fields.push('last_modified = ?');
    values.push(Date.now());
    values.push(hash);
    const stmt = database.prepare(`UPDATE orders SET ${fields.join(', ')} WHERE hash = ?`);
    stmt.run(...values);
    
    // Emit event for order update
    console.log(`Emitting order:updated event for ${hash}`);
  }

  return getOrderByHash(hash);
}

// Get all items for an order
export async function getOrderItems(orderHash: string): Promise<OrderItem[]> {
  const database = await getDb();

  const stmt = database.prepare(`
    SELECT oi.* FROM order_items oi
    JOIN orders o ON oi.order_hash = o.hash
    WHERE oi.order_hash = ? AND o.expires_at > ?
    ORDER BY oi.created_at ASC
  `);
  
  const rows = stmt.all(orderHash, Date.now()) as any[];

  return rows.map(row => ({
    _id: row.id,
    order: row.order_hash,
    nick: row.nick,
    pizza: row.pizza,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

// Add item to order
export async function addOrderItem(
  orderHash: string,
  nick: string,
  pizza: string
): Promise<OrderItem | null> {
  const database = await getDb();
  const now = Date.now();

  // Check if order exists and not expired
  const exists = database.prepare('SELECT 1 FROM orders WHERE hash = ? AND expires_at > ?').get(orderHash, now);
  if (!exists) return null;

  const itemId = `${orderHash}-${now}-${Math.random().toString(36).substr(2, 9)}`;

  const stmt = database.prepare(`
    INSERT INTO order_items (id, order_hash, nick, pizza, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(itemId, orderHash, nick.trim(), pizza.trim(), now);

  // Update order's last_modified timestamp
  database.prepare('UPDATE orders SET last_modified = ? WHERE hash = ?').run(now, orderHash);

  // Emit event for item addition
  console.log(`Emitting order:item:added event for ${orderHash}`);

  return {
    _id: itemId,
    order: orderHash,
    nick: nick.trim(),
    pizza: pizza.trim(),
    createdAt: new Date(now).toISOString(),
  };
}

// Delete item from order
export async function deleteOrderItem(orderHash: string, itemId: string): Promise<boolean> {
  const database = await getDb();

  const stmt = database.prepare(`
    DELETE FROM order_items 
    WHERE id = ? AND order_hash = ?
  `);
  
  const result = stmt.run(itemId, orderHash);
  
  if (result.changes > 0) {
    // Update order's last_modified timestamp
    database.prepare('UPDATE orders SET last_modified = ? WHERE hash = ?').run(Date.now(), orderHash);
    
    // Emit event for item deletion
    console.log(`Emitting order:item:deleted event for ${orderHash}`);
  }
  
  return result.changes > 0;
}

// Get order's last modified timestamp
export async function getOrderLastModified(hash: string): Promise<number | null> {
  const database = await getDb();
  const now = Date.now();

  const stmt = database.prepare(`
    SELECT last_modified FROM orders WHERE hash = ? AND expires_at > ?
  `);
  
  const row = stmt.get(hash, now) as any;
  
  return row ? row.last_modified : null;
}

// Get order with all items
export async function getOrderWithItems(hash: string): Promise<{
  order: Order | null;
  items: OrderItem[];
}> {
  const [order, items] = await Promise.all([
    getOrderByHash(hash),
    getOrderItems(hash),
  ]);

  return { order, items };
}
