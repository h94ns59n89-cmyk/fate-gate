import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { hashPassword } from '@/lib/auth/password';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { token, username, password, nickname } = body;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '123456';
  if (token !== ADMIN_TOKEN) {
    return error(401, '未授权访问', 401);
  }
  if (!username || !password) {
    return error(400, '缺少用户名或密码', 400);
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return error(409, '用户名已存在', 409);
  }
  const passwordHash = hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      wechatOpenid: `user_${username}_${Date.now()}`,
      nickname: nickname || username,
      source: 'username',
    },
  });
  return success({
    id: Number(user.id),
    username: user.username,
    nickname: user.nickname,
  });
});
