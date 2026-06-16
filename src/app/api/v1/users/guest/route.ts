import { withMiddleware } from '@/lib/middleware';
import { success } from '@/lib/api-response';
import { signJWT } from '@/lib/auth/jwt';
import { Logger } from '@/lib/logger';
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

    const userId = Number(user.id);
    const token = await signJWT({ userId });

    return success({
      token,
      user_id: userId,
      nickname: user.nickname,
      avatar_url: user.avatarUrl,
      is_new_user: true,
      has_report: false,
      report_count: 0,
    });
  } catch (err) {
    Logger.for('guest').warn('DB unavailable, returning ephemeral guest user', { error: (err as Error)?.message });
    const ephemeralId = Date.now();
    const token = await signJWT({ userId: ephemeralId });
    return success({
      token,
      user_id: ephemeralId,
      nickname: '游客',
      avatar_url: null,
      is_new_user: true,
      has_report: false,
      report_count: 0,
    });
  }
});
