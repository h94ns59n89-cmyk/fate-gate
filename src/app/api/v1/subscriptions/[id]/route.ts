import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success, notFound } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const DELETE = withMiddleware(async (req, { params }) => {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const id = parseInt(params.id ?? '0', 10);
  if (!id) return notFound('订阅不存在');

  const sub = await prisma.subscription.updateMany({
    where: { id: Number(id), userId: Number(auth.userId), status: 'ACTIVE' },
    data: {
      status: 'CANCELLED',
      autoRenew: false,
      canceledAt: new Date(),
    },
  });

  if (sub.count === 0) return notFound('订阅不存在或已取消');

  return success({ message: '订阅已取消' });
});
