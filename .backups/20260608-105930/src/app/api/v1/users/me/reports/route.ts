import { withMiddleware } from '@/lib/middleware';
import { success } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req) => {
  const userId = BigInt(req.headers.get('X-User-Id') ?? '0');

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
      },
    });

    return success({
      items: reports.map(
        (r: { id: bigint; reportType: string; status: string; createdAt: Date }) => ({
          id: Number(r.id),
          report_type: r.reportType.toLowerCase(),
          status: r.status.toLowerCase(),
          created_at: r.createdAt.toISOString(),
        }),
      ),
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
