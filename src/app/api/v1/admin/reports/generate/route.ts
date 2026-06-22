import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';
import { generateFullReport } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';
import { Logger } from '@/lib/logger';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { token } = body;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '123456';
  if (token !== ADMIN_TOKEN) {
    return error(401, '未授权访问', 401);
  }

  const reportId = body.report_id as number | undefined;
  if (!reportId || isNaN(reportId)) {
    return error(100104, '缺少 report_id', 400);
  }

  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();
  const log = Logger.for('admin:report:generate', trace);

  const report = await prisma.personalityReport.findUnique({
    where: { id: BigInt(reportId) },
    include: { birthInfo: true },
  });

  if (!report) {
    return error(300102, '报告不存在', 404);
  }

  const baziJson = report.baziJson as Record<string, unknown> | null;
  if (!baziJson) {
    return error(400, '报告缺少八字数据', 400);
  }

  const baziData = {
    dayMaster: (baziJson as Record<string, unknown>)?.dayMaster as string ?? '',
    pillars: baziJson as Record<string, unknown>,
    fiveElements: (report.fiveElementsJson as Record<string, unknown>) ?? {},
    shishen: (report.shishenJson as Record<string, unknown>) ?? {},
    dayun: (report.dayunJson as Record<string, unknown>) ?? {},
    calculationMeta: (baziJson as Record<string, unknown>)?.calculation_meta,
  };

  log.info(`Generating full report for report ${reportId}`);

  try {
    const { data: reportData, provider, latencyMs } = await generateFullReport(baziData, { trace });

    if (reportData) {
      await prisma.personalityReport.update({
        where: { id: BigInt(reportId) },
        data: {
          status: 'COMPLETED',
          fullReportJson: reportData as never,
          aiModel: provider,
          generatedAt: new Date(),
        },
      });
      log.info(`Report ${reportId} generated successfully`, { provider, latency_ms: latencyMs });
      return success({
        report_id: reportId,
        status: 'completed',
        provider,
        latency_ms: latencyMs,
        full_report: reportData,
      });
    } else {
      await prisma.personalityReport.update({
        where: { id: BigInt(reportId) },
        data: { status: 'FAILED', errorMessage: 'AI generation returned empty result' },
      });
      return error(500, 'AI 生成返回空结果', 502);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed to generate report ${reportId}`, { error: msg });
    await prisma.personalityReport.update({
      where: { id: BigInt(reportId) },
      data: { status: 'FAILED', errorMessage: msg },
    }).catch(() => {});
    return error(500, `生成失败: ${msg}`, 500);
  }
});
