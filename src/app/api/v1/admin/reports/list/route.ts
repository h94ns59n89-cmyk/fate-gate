import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { extractAdminToken, checkAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/db/client';
import { Prisma } from '@prisma/client';

const jsonNull = Prisma.JsonNullValueFilter.DbNull;

export const GET = withMiddleware(async (req) => {
  const token = extractAdminToken(req);
  if (!checkAdminToken(token)) {
    return error(401, '未授权访问', 401);
  }

  const [pendingReports, completedReports, pendingComparisons, completedComparisons] = await Promise.all([
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
    prisma.comparison.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.comparison.findMany({
      where: { status: 'COMPLETED' },
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return success({
    pending: [
      ...pendingReports.map((r) => ({
        kind: 'personality' as const,
        id: Number(r.id),
        user_id: Number(r.userId),
        user_nickname: r.user.nickname ?? '未知用户',
        created_at: r.createdAt.toISOString(),
      })),
      ...pendingComparisons.map((c) => ({
        kind: 'comparison' as const,
        id: Number(c.id),
        user_id: Number(c.userId),
        user_nickname: c.user.nickname ?? '未知用户',
        created_at: c.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    completed: [
      ...completedReports.map((r) => ({
        kind: 'personality' as const,
        id: Number(r.id),
        user_id: Number(r.userId),
        user_nickname: r.user.nickname ?? '未知用户',
        created_at: r.createdAt.toISOString(),
        generated_at: r.generatedAt?.toISOString() ?? null,
      })),
      ...completedComparisons.map((c) => ({
        kind: 'comparison' as const,
        id: Number(c.id),
        user_id: Number(c.userId),
        user_nickname: c.user.nickname ?? '未知用户',
        created_at: c.createdAt.toISOString(),
        generated_at: null,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  });
});
