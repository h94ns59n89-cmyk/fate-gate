import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';
import { Prisma } from '@prisma/client';

const jsonNull = Prisma.JsonNullValueFilter.DbNull;

export const GET = withMiddleware(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '123456';
  if (token !== ADMIN_TOKEN) {
    return error(401, '未授权访问', 401);
  }

  const [pendingReports, completedReports] = await Promise.all([
    prisma.personalityReport.findMany({
      where: {
        reportType: 'FREE',
        status: 'COMPLETED',
        fullReportJson: { equals: jsonNull },
      },
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.personalityReport.findMany({
      where: {
        reportType: 'FREE',
        status: 'COMPLETED',
        NOT: { fullReportJson: { equals: jsonNull } },
      },
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return success({
    pending: pendingReports.map((r) => ({
      id: Number(r.id),
      user_id: Number(r.userId),
      user_nickname: r.user.nickname ?? '未知用户',
      created_at: r.createdAt.toISOString(),
    })),
    completed: completedReports.map((r) => ({
      id: Number(r.id),
      user_id: Number(r.userId),
      user_nickname: r.user.nickname ?? '未知用户',
      created_at: r.createdAt.toISOString(),
      generated_at: r.generatedAt?.toISOString() ?? null,
    })),
  });
});
