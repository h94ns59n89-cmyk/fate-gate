import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { verifyPassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { username, password } = body;
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
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  const userId = Number(user.id);
  const token = await signJWT({ userId });
  return success({
    token,
    user_id: userId,
    nickname: user.nickname,
    avatar_url: user.avatarUrl,
    username: user.username,
  });
});
