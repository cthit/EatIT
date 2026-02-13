import { startCleanupService } from '@/lib/cleanup-service';

// Initialize cleanup service when this module is first imported
if (typeof window === 'undefined') {
  // Only run on server-side
  startCleanupService();
}

export {};
