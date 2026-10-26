'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { menuBrowser } from '@/lib/menu-browser';

export async function scrapeMenu(restaurantId: string) {
  let failed = false;

  try {
    await menuBrowser.scrapeRestaurant(restaurantId);
  } catch (error) {
    console.error(`Failed to scrape menu for ${restaurantId}:`, error);
    failed = true;
  }

  revalidatePath(`/menus/${restaurantId}`);

  if (failed) {
    redirect(`/menus/${restaurantId}?error=scrape`);
  }
}
