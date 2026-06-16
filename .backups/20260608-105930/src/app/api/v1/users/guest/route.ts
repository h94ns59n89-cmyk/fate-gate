import { withMiddleware } from '@/lib/middleware';
import { success } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async () => {
  try {
    const user = await prisma.user.create({
      data: {
        wechatOpenid: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        nickname: '游客',
        source: 'guest',
      },
    });

    return success({
      id: Number(user.id),
      nickname: user.nickname,
      avatar_url: user.avatarUrl,
      is_new_user: true,
      has_report: false,
      report_count: 0,
    });
  } catch {
    console.warn('DB unavailable, returning ephemeral guest user');
    return success({
      id: Date.now(),
      nickname: '游客',
      avatar_url: null,
      is_new_user: true,
      has_report: false,
      report_count: 0,
    });
  }
});
