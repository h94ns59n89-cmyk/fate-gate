import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  try {
    const body = await req.json();
    const { user_id, target_user_id, user_bazi, target_bazi, target_tags, user_tags } = body;

    if (!target_bazi || !user_bazi) {
      return error(100104, '缺少 target_bazi 或 user_bazi', 400);
    }

    const uid = user_id ? Number(user_id) : null;
    if (!uid) {
      return error(100104, '缺少 user_id', 400);
    }

    const comparison = await prisma.comparison.create({
      data: {
        userId: uid,
        targetUserId: target_user_id ? Number(target_user_id) : null,
        status: 'PENDING',
        userBaziJson: user_bazi as never,
        targetBaziJson: target_bazi as never,
        userTags: user_tags as never,
        targetTags: target_tags as never,
        isPaid: false,
      },
    });

    return success({
      id: Number(comparison.id),
      status: 'PENDING',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return error(500, `创建失败: ${msg}`, 500);
  }
});
