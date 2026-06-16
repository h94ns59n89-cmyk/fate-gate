import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req) => {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const userId = BigInt(auth.userId);

  try {
    const reports = await prisma.personalityReport.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        reportType: true,
        status: true,
        createdAt: true,
        personalityTags: true,
        fiveElementsJson: true,
        summaryJson: true,
        baziJson: true,
      },
    });

    return success({
      items: reports.map((r) => ({
        id: Number(r.id),
        report_type: r.reportType.toLowerCase(),
        status: r.status.toLowerCase(),
        created_at: r.createdAt.toISOString(),
        personality_tags: r.personalityTags,
        five_elements: r.fiveElementsJson,
        summary: r.summaryJson,
        bazi: r.baziJson,
      })),
      page_token: null,
      next_page_token: null,
      total: reports.length,
    });
  } catch {
    return success({
      items: [],
      page_token: null,
      next_page_token: null,
      total: 0,
    });
  }
});
