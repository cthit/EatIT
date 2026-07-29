import { cleanupExpiredSessions } from '@/lib/storage';

// Run cleanup every hour
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

let cleanupInterval: NodeJS.Timeout | null = null;

export function startCleanupService() {
  if (cleanupInterval) {
    return; // Already started
  }

  // Run cleanup immediately on startup
  cleanupExpiredSessions().catch(error => {
    console.error('Error during initial cleanup:', error);
  });

  // Schedule periodic cleanup
  cleanupInterval = setInterval(() => {
    cleanupExpiredSessions().catch(error => {
      console.error('Error during scheduled cleanup:', error);
    });
  }, CLEANUP_INTERVAL);

  console.log('Session cleanup service started');
}

export function stopCleanupService() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('Session cleanup service stopped');
  }
}
