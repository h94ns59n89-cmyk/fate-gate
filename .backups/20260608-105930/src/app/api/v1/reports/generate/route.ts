import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { generateFullReport } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { bazi_data } = body;
  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();

  if (!bazi_data) {
    return error(100104, '缺少 bazi_data', 400);
  }

  const { data, provider, latencyMs } = await generateFullReport(bazi_data, { trace });

  if (!data) {
    return error(500102, 'AI 解读服务不可用', 502);
  }

  return success({
    report: data,
    provider,
    latency_ms: latencyMs,
  });
});
