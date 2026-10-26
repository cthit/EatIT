import { NextRequest, NextResponse } from 'next/server';
import { withHandler, jsonError } from '@/lib/api';
import { menuBrowser } from '@/lib/menu-browser';

type Context = { params: Promise<{ id: string }> };

export const GET = withHandler<Context>(
  'fetch restaurant menu',
  async (_request: NextRequest, { params }: Context) => {
    const { id } = await params;

    const menu = await menuBrowser.getMenu(id);
    if (!menu) {
      return jsonError('Menu not found', 404);
    }

    return NextResponse.json(menu);
  }
);
