import schedule from 'node-schedule';
import { menuBrowser } from '@/lib/menu-browser';
import { scraperRegistry } from '@/lib/scrapers';

const SCRAPE_STARTUP_DELAY_MS = 15_000;
const SCRAPE_CRON = '0 3 * * *';

const globalForScheduler = globalThis as typeof globalThis & {
  eatitMenuSchedulerStarted?: boolean;
};

let refreshing = false;

async function refreshAllMenus(): Promise<void> {
  if (refreshing) {
    console.warn('Menu refresh already running, skipping');
    return;
  }

  refreshing = true;
  try {
    for (const scraper of scraperRegistry.list()) {
      try {
        const menu = await menuBrowser.scrapeRestaurant(scraper.id);
        const itemCount = menu.sections.reduce((count, section) => count + section.items.length, 0);
        console.log(`Refreshed menu for ${scraper.name} (${itemCount} items)`);
      } catch (error) {
        console.error(`Failed to refresh menu for ${scraper.id}:`, error);
      }
    }
  } finally {
    refreshing = false;
  }
}

/**
 * Start the background menu refresh job once per server process. The first
 * refresh runs shortly after startup so new restaurants get a cached menu
 * without waiting for the daily run.
 */
export function startMenuScheduler(): void {
  if (globalForScheduler.eatitMenuSchedulerStarted) return;
  globalForScheduler.eatitMenuSchedulerStarted = true;

  setTimeout(() => {
    void refreshAllMenus();
  }, SCRAPE_STARTUP_DELAY_MS);

  schedule.scheduleJob(SCRAPE_CRON, () => {
    void refreshAllMenus();
  });

  console.log(`Menu refresh scheduled (${SCRAPE_CRON})`);
}
