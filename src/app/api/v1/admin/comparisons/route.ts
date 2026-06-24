import { withMiddleware } from '@/lib/middleware';
import { success } from '@/lib/api-response';
import prisma from '@/lib/db/client';

const ADMIN_TOKEN = '123456';

export const GET = withMiddleware(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  if (token !== ADMIN_TOKEN) return success({ items: [], total: 0 });

  try {
    const comparisons = await prisma.comparison.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        userId: true,
        targetUserId: true,
        matchScore: true,
        dimensionsJson: true,
        adviceJson: true,
        isPaid: true,
        createdAt: true,
      },
    });

    const userIds = new Set<number>();
    for (const c of comparisons) {
      userIds.add(Number(c.userId));
      if (c.targetUserId) userIds.add(Number(c.targetUserId));
    }

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, nickname: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [Number(u.id), u.nickname]));

    const items = comparisons.map((c) => {
      const advice = c.adviceJson as Record<string, unknown> | null;
      return {
        id: Number(c.id),
        user_id: Number(c.userId),
        user_nickname: userMap[Number(c.userId)] ?? `u_${c.userId}`,
        target_user_id: c.targetUserId ? Number(c.targetUserId) : null,
        target_nickname: c.targetUserId ? (userMap[Number(c.targetUserId)] ?? `u_${c.targetUserId}`) : null,
        match_score: c.matchScore,
        dimensions: c.dimensionsJson,
        complementarity: advice?.complementarity ?? '',
        strengths: (advice?.strengths as string[]) ?? [],
        potential_conflicts: (advice?.potential_conflicts as string[]) ?? [],
        advice: advice?.advice ?? '',
        summary_tag: (advice?.summary_tag as string) ?? '',
        target_tags: (advice?.target_tags as string[]) ?? [],
        user_tags: (advice?.user_tags as string[]) ?? [],
        is_paid: c.isPaid,
        created_at: c.createdAt.toISOString(),
      };
    });

    return success({ items, total: items.length });
  } catch {
    return success({ items: [], total: 0 });
  }
});
