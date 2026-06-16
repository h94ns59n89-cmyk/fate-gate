import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import prisma from '@/lib/db/client';
import { generateFullReport } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { birth_info_id, report_type, idempotency_key } = body;
  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();

  if (!birth_info_id) {
    return error(100104, '缺少必填字段: birth_info_id', 400);
  }

  const idempotentKey = `idem:report:${idempotency_key}`;
  const existing = await cache.get(idempotentKey);
  if (existing) {
    return success(existing);
  }

  const birthInfo = await prisma.birthInfo.findUnique({
    where: { id: BigInt(birth_info_id) },
  });

  if (!birthInfo) {
    return error(300102, '出生信息不存在', 404);
  }

  const report = await prisma.personalityReport.create({
    data: {
      userId: birthInfo.userId,
      birthInfoId: birthInfo.id,
      reportType: report_type === 'paid' ? 'PAID' : 'FREE',
      status: 'PENDING',
      baziJson: {},
    },
  });

  const reportId = Number(report.id);

  // Generate full report via AI (async, non-blocking)
  Promise.resolve().then(async () => {
    try {
      const previousReports = await prisma.personalityReport.findFirst({
        where: { birthInfoId: birthInfo.id, reportType: report_type === 'paid' ? 'PAID' : 'FREE', status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
      });

      const baziData = {
        dayMaster: '甲木',
        pillars: (previousReports?.baziJson as Record<string, unknown>) ?? {},
        fiveElements: (previousReports?.fiveElementsJson as Record<string, unknown>) ?? {},
        shishen: (previousReports?.shishenJson as Record<string, unknown>) ?? {},
        dayun: (previousReports?.dayunJson as Record<string, unknown>) ?? {},
      };

      const { data: reportData, provider, latencyMs } = await generateFullReport(baziData, { trace });

      if (reportData) {
        await prisma.personalityReport.update({
          where: { id: BigInt(reportId) },
          data: {
            status: 'COMPLETED',
            fullReportJson: reportData as never,
            summaryJson: { life_theme: reportData.cover?.life_theme ?? '' },
            aiModel: provider,
            generatedAt: new Date(),
          },
        });
        console.log(`[Report] Generated report ${reportId} via ${provider} in ${latencyMs}ms`);
      } else {
        await prisma.personalityReport.update({
          where: { id: BigInt(reportId) },
          data: { status: 'FAILED', errorMessage: 'AI generation returned empty result' },
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Report] Failed to generate report ${reportId}:`, msg);
      await prisma.personalityReport.update({
        where: { id: BigInt(reportId) },
        data: { status: 'FAILED', errorMessage: msg },
      }).catch(() => {});
    }
  });

  const response = {
    report_id: reportId,
    status: 'pending',
    poll_url: `/api/v1/reports/${reportId}/status`,
    estimated_wait_ms: 10000,
  };

  await cache.set(idempotentKey, response, CACHE_TTL.IDEMPOTENT);

  return success(response, 202);
});
