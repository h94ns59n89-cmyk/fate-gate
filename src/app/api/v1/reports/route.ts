import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import prisma from '@/lib/db/client';
import { generateFullReport } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';
import { Logger } from '@/lib/logger';
import { reportsCreateSchema } from '@/lib/validation';

export const POST = withMiddleware(async (req) => {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = reportsCreateSchema.safeParse(body);
  if (!parsed.success) {
    return error(100104, parsed.error?.issues?.[0]?.message ?? '参数校验失败', 400);
  }
  const { birth_info_id, report_type, idempotency_key } = parsed.data;
  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();

  const idempotentKey = `idem:report:${idempotency_key}`;
  const existing = await cache.get(idempotentKey);
  if (existing) {
    return success(existing);
  }

  const birthInfo = await prisma.birthInfo.findUnique({
    where: { id: Number(birth_info_id) },
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
  const log = Logger.for('report', trace);

  // Generate full report via AI (async, non-blocking)
  const failTimer = setTimeout(async () => {
    log.error(`Generation ${reportId} timed out after 120s`);
    await prisma.personalityReport.update({
      where: { id: Number(reportId) },
      data: { status: 'FAILED', errorMessage: 'AI生成超时，请稍后重试' },
    }).catch(() => {});
  }, 120_000);

  Promise.resolve().then(async () => {
    try {
      const previousReports = await prisma.personalityReport.findFirst({
        where: { birthInfoId: birthInfo.id, reportType: report_type === 'paid' ? 'PAID' : 'FREE', status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
      });

      const prevBazi = (previousReports?.baziJson as Record<string, unknown>) ?? {};
      const pillars = {
        year: prevBazi?.year_pillar,
        month: prevBazi?.month_pillar,
        day: prevBazi?.day_pillar,
        hour: prevBazi?.hour_pillar,
      };
      const baziData = {
        dayMaster: (prevBazi?.dayMaster as string) || (prevBazi?.day_master as string) || '',
        dayMasterElement: (prevBazi?.day_master_element as string) || '',
        pillars,
        fiveElements: (previousReports?.fiveElementsJson as Record<string, unknown>) ?? {},
        shishen: (previousReports?.shishenJson as Record<string, unknown>) ?? {},
        dayun: (previousReports?.dayunJson as Record<string, unknown>) ?? {},
        calculationMeta: prevBazi?.calculation_meta,
      };

      const { data: reportData, provider, latencyMs } = await generateFullReport(baziData, { trace });

      clearTimeout(failTimer);
      if (latencyMs > 30_000) {
        log.warn(`Slow generation for ${reportId}: ${latencyMs}ms`, { provider });
      }
      if (reportData) {
        await prisma.personalityReport.update({
          where: { id: Number(reportId) },
          data: {
            status: 'COMPLETED',
            fullReportJson: reportData as never,
            summaryJson: { life_theme: reportData.cover?.life_theme ?? null },
            aiModel: provider,
            generatedAt: new Date(),
          },
        });
        log.info(`Generated report ${reportId}`, { provider, latency_ms: latencyMs });
      } else {
        await prisma.personalityReport.update({
          where: { id: Number(reportId) },
          data: { status: 'FAILED', errorMessage: 'AI generation returned empty result' },
        });
      }
    } catch (err) {
      clearTimeout(failTimer);
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`Failed to generate report ${reportId}`, { error: msg });
      await prisma.personalityReport.update({
        where: { id: Number(reportId) },
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
