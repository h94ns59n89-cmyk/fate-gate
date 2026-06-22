import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '123456';
  if (token !== ADMIN_TOKEN) {
    return error(401, '未授权访问', 401);
  }
  const users = await prisma.user.findMany({
    where: { deletedAt: null, source: 'username' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      username: true,
      nickname: true,
      createdAt: true,
    },
  });
  return success({
    users: users.map((u) => ({
      id: Number(u.id),
      username: u.username,
      nickname: u.nickname,
      created_at: u.createdAt.toISOString(),
    })),
  });
});
