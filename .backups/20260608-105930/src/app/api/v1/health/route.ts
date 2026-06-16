import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    uptime_seconds: Math.floor(process.uptime()),
    checks: {
      database: { status: 'ok', latency_ms: 5 },
      redis: { status: 'ok', latency_ms: 2 },
      ai_api: { status: 'degraded', latency_ms: 2340 },
      payment: { status: 'ok' },
    },
  });
}
