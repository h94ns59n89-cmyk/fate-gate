import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get('reportId');

  if (!reportId) {
    return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;width:800px;height:1200px;background:linear-gradient(135deg,#1A1A2E,#16213E,#0F3460);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;color:#fff;">
  <h1 style="font-size:48px;color:#D4A853;margin-bottom:16px;">你的人格</h1>
  <div style="font-size:36px;margin-bottom:40px;">甲木型 · 领导者人格</div>
  <div style="font-size:72px;color:#D4A853;margin-bottom:40px;">85%</div>
  <div style="font-size:24px;opacity:0.8;">星隅测试</div>
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
