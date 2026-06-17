import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success, notFound } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req, { params }) => {
  const id = parseInt(params.id ?? '0', 10);
  if (!id) return notFound('报告不存在');

  try {
    const report = await prisma.personalityReport.findUnique({
      where: { id: BigInt(id) },
    });

    if (!report) return notFound('报告不存在');

    return success({
      id: Number(report.id),
      report_type: report.reportType.toLowerCase(),
      status: report.status.toLowerCase(),
      bazi: report.baziJson,
      five_elements: report.fiveElementsJson,
      personality_tags: report.personalityTags,
      summary: report.summaryJson,
      full_report: report.fullReportJson,
      created_at: report.createdAt.toISOString(),
      generated_at: report.generatedAt?.toISOString() ?? null,
    });
  } catch {
    return notFound('报告不存在');
  }
});

export const DELETE = withMiddleware(async (req, { params }) => {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt(params.id ?? '0', 10);
  if (!id) return notFound('报告不存在');

  const userId = BigInt(auth.userId);

  try {
    const report = await prisma.personalityReport.findFirst({
      where: { id: BigInt(id), userId, deletedAt: null },
    });

    if (!report) return notFound('报告不存在');

    await prisma.personalityReport.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });

    return success({ id: Number(id) });
  } catch {
    return notFound('报告不存在');
  }
});
