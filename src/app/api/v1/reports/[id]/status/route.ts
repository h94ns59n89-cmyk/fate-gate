import { withMiddleware } from '@/lib/middleware';
import { success, notFound } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req, { params }) => {
  const id = parseInt(params.id ?? '0', 10);
  if (!id) return notFound('报告不存在');

  const report = await prisma.personalityReport.findUnique({
    where: { id: Number(id) },
    select: { id: true, status: true, reportType: true, createdAt: true },
  });

  if (!report) return notFound('报告不存在');

  return success({
    id: Number(report.id),
    status: report.status.toLowerCase(),
    report_type: report.reportType.toLowerCase(),
    created_at: report.createdAt.toISOString(),
  });
});
