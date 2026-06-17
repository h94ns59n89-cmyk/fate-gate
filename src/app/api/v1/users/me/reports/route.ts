import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req) => {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const userId = BigInt(auth.userId);

  try {
    const [reports, comparisons] = await Promise.all([
      prisma.personalityReport.findMany({
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
      }),
      prisma.comparison.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          matchScore: true,
          isPaid: true,
          createdAt: true,
          dimensionsJson: true,
          adviceJson: true,
        },
      }),
    ]);

    const items = [
      ...reports.map((r) => ({
        kind: 'personality' as const,
        id: Number(r.id),
        report_type: r.reportType.toLowerCase(),
        status: r.status.toLowerCase(),
        created_at: r.createdAt.toISOString(),
        personality_tags: r.personalityTags,
        five_elements: r.fiveElementsJson,
        summary: r.summaryJson,
        bazi: r.baziJson,
      })),
      ...comparisons.map((c) => {
        const advice = c.adviceJson as Record<string, unknown> | null;
        return {
          kind: 'comparison' as const,
          id: Number(c.id),
          match_score: c.matchScore,
          is_paid: c.isPaid,
          created_at: c.createdAt.toISOString(),
          summary_tag: (advice?.summary_tag as string) ?? null,
        };
      }),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return success({
      items,
      page_token: null,
      next_page_token: null,
      total: items.length,
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
