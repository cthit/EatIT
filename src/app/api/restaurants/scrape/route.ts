import { NextRequest, NextResponse } from 'next/server';
import { withHandler, jsonError, isText } from '@/lib/api';
import { menuBrowser } from '@/lib/menu-browser';

export const POST = withHandler('scrape restaurant menu', async (request: NextRequest) => {
  const { restaurantId, url } = await request.json();

  if (!isText(restaurantId, 100) && !isText(url, 500)) {
    return jsonError('restaurantId or url is required', 400);
  }

  if (isText(url, 500)) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return jsonError('url must be a valid URL', 400);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return jsonError('url must use http or https', 400);
    }
  }

  try {
    const menu = isText(restaurantId, 100)
      ? await menuBrowser.scrapeRestaurant(restaurantId)
      : await menuBrowser.scrapeUrl(url);
    return NextResponse.json(menu);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown scrape error';
    return jsonError(message, 422);
  }
});
