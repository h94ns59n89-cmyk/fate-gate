import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { generateFullReport } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';
import { extractAdminToken, checkAdminToken } from '@/lib/admin-auth';
import { reportsGenerateSchema } from '@/lib/validation';

export const POST = withMiddleware(async (req) => {
  const adminToken = extractAdminToken(req);
  if (!adminToken || !checkAdminToken(adminToken)) {
    return error(200101, '无权限访问', 401);
  }

  const body = await req.json();
  const parsed = reportsGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return error(100104, parsed.error?.issues?.[0]?.message ?? '参数校验失败', 400);
  }
  const { bazi_data } = parsed.data;
  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();

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
