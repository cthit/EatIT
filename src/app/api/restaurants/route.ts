import { NextResponse } from 'next/server';
import { withHandler } from '@/lib/api';
import { menuBrowser } from '@/lib/menu-browser';

export const GET = withHandler('fetch restaurants', async () => {
  return NextResponse.json(await menuBrowser.listRestaurants());
});
