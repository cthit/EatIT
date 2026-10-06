import { NextRequest, NextResponse } from 'next/server';

export const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

export function withHandler(
  label: string,
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error) {
      console.error(`Error in ${label}:`, error);
      return jsonError(`Failed to ${label}`, 500);
    }
  };
}
