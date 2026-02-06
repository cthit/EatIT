import { getDb } from '../lib/mongodb';

async function setupIndexes() {
  try {
    console.log('Setting up MongoDB indexes...');
    
    const db = await getDb();
    
    // Create TTL index on orders collection (expires after 24 hours)
    await db.collection('orders').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 60 * 60 * 24 }
    );
    console.log('✓ Created TTL index on orders.createdAt');

    // Create index on orders hash for faster lookups
    await db.collection('orders').createIndex(
      { hash: 1 },
      { unique: true }
    );
    console.log('✓ Created unique index on orders.hash');

    // Create TTL index on order_items collection (expires after 24 hours)
    await db.collection('order_items').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 60 * 60 * 24 }
    );
    console.log('✓ Created TTL index on order_items.createdAt');

    // Create index on order_items.order for faster queries
    await db.collection('order_items').createIndex({ order: 1 });
    console.log('✓ Created index on order_items.order');

    console.log('\nAll indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up indexes:', error);
    process.exit(1);
  }
}

setupIndexes();
