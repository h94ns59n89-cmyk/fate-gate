import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { checkAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/db/client';
import { generateFullReport, generateComparison } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';
import { Logger } from '@/lib/logger';

export const maxDuration = 120;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} 超时 (${ms}ms)`)), ms)),
  ]);
}

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { token, kind, model, apiKey, baseUrl } = body;
  if (!checkAdminToken(token ?? '')) {
    return error(401, '未授权访问', 401);
  }

  const reportId = body.report_id as number | undefined;
  if (!reportId || isNaN(reportId)) {
    return error(100104, '缺少 report_id', 400);
  }

  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();
  const log = Logger.for('admin:report:generate', trace);

  if (kind === 'comparison') {
    const comparison = await prisma.comparison.findUnique({
      where: { id: Number(reportId) },
    });

    if (!comparison) {
      return error(300102, '合盘报告不存在', 404);
    }

    const userBazi = comparison.userBaziJson as Record<string, unknown> | null;
    const targetBazi = comparison.targetBaziJson as Record<string, unknown> | null;
    if (!userBazi || !targetBazi) {
      return error(400, '合盘报告缺少八字数据', 400);
    }

    log.info(`Generating comparison report for comparison ${reportId}`);

    try {
      const genOpts = { ...(model ? { model } : {}), trace, ...(apiKey ? { apiKey, baseUrl } : {}) };
      const { data: result, provider, latencyMs } = await withTimeout(generateComparison(targetBazi, userBazi, genOpts), 90000, 'AI 合盘生成');

      if (result) {
        await prisma.comparison.update({
          where: { id: Number(reportId) },
          data: {
            status: 'COMPLETED',
            matchScore: result.overall_match,
            dimensionsJson: result.dimensions as never,
            adviceJson: {
              complementarity: result.complementarity,
              strengths: result.strengths,
              potential_conflicts: result.potential_conflicts,
              advice: result.advice,
              target_tags: comparison.targetTags ?? [],
              user_tags: comparison.userTags ?? [],
              summary_tag: result.summary_tag,
            } as never,
          },
        });

        log.info(`Comparison ${reportId} generated successfully`, { provider, latency_ms: latencyMs });
        return success({
          report_id: reportId,
          status: 'completed',
          provider,
          latency_ms: latencyMs,
        });
      } else {
        return error(500, 'AI 生成返回空结果', 502);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`Failed to generate comparison ${reportId}`, { error: msg });
      return error(500, `生成失败: ${msg}`, 500);
    }
  }

  // Personality report generation
  const report = await prisma.personalityReport.findUnique({
    where: { id: Number(reportId) },
    include: { birthInfo: true },
  });

  if (!report) {
    return error(300102, '报告不存在', 404);
  }

  const baziJson = report.baziJson as Record<string, unknown> | null;
  if (!baziJson) {
    return error(400, '报告缺少八字数据', 400);
  }

  const bj = baziJson as Record<string, unknown>;
  const baziData = {
    dayMaster: (bj?.dayMaster as string) || (bj?.day_master as string) || '',
    pillars: bj,
    fiveElements: (report.fiveElementsJson as Record<string, unknown>) ?? {},
    shishen: (report.shishenJson as Record<string, unknown>) ?? {},
    dayun: (report.dayunJson as Record<string, unknown>) ?? {},
    calculationMeta: bj?.calculation_meta,
  };

  log.info(`Generating full report for report ${reportId}`);

  try {
    const genOpts = { ...(model ? { model } : {}), trace, ...(apiKey ? { apiKey, baseUrl } : {}) };
    const { data: reportData, provider, latencyMs } = await withTimeout(generateFullReport(baziData, genOpts), 90000, 'AI 报告生成');

    if (reportData) {
      // Override AI-generated timestamp with server time
      if (reportData.cover) {
        (reportData.cover as unknown as Record<string, unknown>).generated_at = new Date().toISOString();
      }
      await prisma.personalityReport.update({
        where: { id: Number(reportId) },
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
      return error(500, 'AI 生成返回空结果', 502);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed to generate report ${reportId}`, { error: msg });
    return error(500, `生成失败: ${msg}`, 500);
  }
});
