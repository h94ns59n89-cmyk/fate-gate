import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';
import { generateFullReport } from '@/lib/ai/completions';
import { Logger } from '@/lib/logger';

export const POST = withMiddleware(async (req, { params }) => {
  if (process.env.NODE_ENV !== 'development') {
    return error(403, '仅开发环境可用', 403);
  }
  const { orderNo } = params;
  if (!orderNo) return error(400101, '订单号不能为空', 400);

  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const order = await prisma.order.findUnique({ where: { orderNo } });
  if (!order) return error(400102, '订单不存在', 404);
  if (order.status !== 'PENDING') return error(400103, '订单已处理', 400);

  await prisma.order.update({
    where: { orderNo },
    data: {
      status: 'PAID',
      transactionId: `mock_txn_${Date.now()}`,
      paidAt: new Date(),
    },
  });

  let fullReport = null;

  if (order.productType === 'COMPARISON') {
    const body = await req.json().catch(() => ({}));
    const comparisonId = body.comparison_id ?? (order.reportId ? Number(order.reportId) : null);
    if (comparisonId) {
      await prisma.comparison.update({
        where: { id: Number(comparisonId) },
        data: { isPaid: true },
      });
    }
  } else if (order.reportId) {
    const report = await prisma.personalityReport.findUnique({
      where: { id: order.reportId },
    });

    if (report) {
      const bazi = report.baziJson as Record<string, unknown> | null;
      const pillars = bazi ?? {};
      const dayPillar = pillars['day_pillar'] as Record<string, string> | undefined;
      const dayMaster = dayPillar?.heavenly ?? '甲';

      const baziData: Record<string, unknown> = {
        dayMaster: dayMaster + '木',
        dayMasterElement: '木',
        pillars,
        fiveElements: report.fiveElementsJson ?? {},
        shishen: {},
        dayun: {},
        calculationMeta: pillars['calculation_meta'] ?? {},
      };

      try {
        const result = await generateFullReport(baziData);
        fullReport = result.data;

        await prisma.personalityReport.update({
          where: { id: order.reportId },
          data: {
            reportType: 'PAID',
            fullReportJson: fullReport as never,
          },
        });
      } catch (err) {
        Logger.for('mock-pay').warn('Full report generation failed', { error: (err as Error)?.message });
        await prisma.personalityReport.update({
          where: { id: order.reportId },
          data: { reportType: 'PAID' },
        });
      }
    }
  }

  return success({ full_report: fullReport });
});
