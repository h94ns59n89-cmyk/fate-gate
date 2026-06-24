import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { verifyPassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { username, password, guest_user_id } = body;
  if (!username || !password) {
    return error(400, '缺少用户名或密码', 400);
  }
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.passwordHash) {
    return error(401, '用户名或密码错误', 401);
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return error(401, '用户名或密码错误', 401);
  }

  const realUserId = Number(user.id);

  // Migrate guest reports/comparisons to this user
  if (guest_user_id && Number(guest_user_id) !== realUserId) {
    const gid = Number(guest_user_id);
    await Promise.allSettled([
      prisma.personalityReport.updateMany({ where: { userId: gid }, data: { userId: realUserId } }),
      prisma.comparison.updateMany({ where: { userId: gid }, data: { userId: realUserId } }),
      prisma.comparison.updateMany({ where: { targetUserId: gid }, data: { targetUserId: realUserId } }),
      prisma.birthInfo.updateMany({ where: { userId: gid }, data: { userId: realUserId } }),
    ]);
  }

  await prisma.user.update({
    where: { id: realUserId },
    data: { lastLoginAt: new Date() },
  });
  const token = await signJWT({ userId: realUserId });
  return success({
    token,
    user_id: realUserId,
    nickname: user.nickname,
    avatar_url: user.avatarUrl,
    username: user.username,
  });
});
