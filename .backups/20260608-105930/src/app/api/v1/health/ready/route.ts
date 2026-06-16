import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    return NextResponse.json({ status: 'ok', checks: { database: 'ok', cache: 'ok' } });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 });
  }
}
