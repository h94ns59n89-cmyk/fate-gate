import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { extractAdminToken, checkAdminToken } from '@/lib/admin-auth';
import { success, notFound, error as apiError } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req, { params }) => {
  const id = parseInt(params.id ?? '0', 10);
  if (!id) return notFound('报告不存在');

  const adminToken = extractAdminToken(req);
  const isAdmin = adminToken && checkAdminToken(adminToken);

  if (!isAdmin) {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    try {
      const report = await prisma.personalityReport.findFirst({
        where: { id: Number(id), userId: Number(auth.userId) },
      });
      if (!report) return notFound('报告不存在');
      return success(formatReport(report));
    } catch {
      return notFound('报告不存在');
    }
  }

  try {
    const report = await prisma.personalityReport.findUnique({
      where: { id: Number(id) },
    });
    if (!report) return notFound('报告不存在');
    return success(formatReport(report));
  } catch {
    return notFound('报告不存在');
  }
});

function formatReport(report: { id: number; reportType: string; status: string; baziJson: unknown; fiveElementsJson: unknown; personalityTags: unknown; summaryJson: unknown; fullReportJson: unknown; createdAt: Date; generatedAt: Date | null }) {
  return {
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
  };
}

export const DELETE = withMiddleware(async (req, { params }) => {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt(params.id ?? '0', 10);
  if (!id) return notFound('报告不存在');

  const userId = Number(auth.userId);

  try {
    const report = await prisma.personalityReport.findFirst({
      where: { id: Number(id), userId, deletedAt: null },
    });

    if (!report) return notFound('报告不存在');

    await prisma.personalityReport.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    return success({ id: Number(id) });
  } catch {
    return notFound('报告不存在');
  }
});
