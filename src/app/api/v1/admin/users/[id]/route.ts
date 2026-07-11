import { NextResponse } from 'next/server';
import { success, error, notFound } from '@/lib/api-response';
import { extractAdminToken, checkAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/db/client';

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const token = extractAdminToken(req);
  if (!token || !checkAdminToken(token)) {
    return error(200101, '无权限访问', 401);
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (!userId || isNaN(userId)) return notFound('用户不存在');

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return notFound('用户不存在');

    await prisma.$transaction([
      prisma.sharingRecord.deleteMany({ where: { userId } }),
      prisma.sharingRecord.deleteMany({ where: { invitedUserId: userId } }),
      prisma.comparison.deleteMany({ where: { userId } }),
      prisma.comparison.deleteMany({ where: { targetUserId: userId } }),
      prisma.order.deleteMany({ where: { userId } }),
      prisma.subscription.deleteMany({ where: { userId } }),
      prisma.personalityReport.deleteMany({ where: { userId } }),
      prisma.birthInfo.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return success({ message: `用户 ${user.nickname ?? userId} 已删除` });
  } catch (err) {
    return error(500, `删除失败: ${err instanceof Error ? err.message : String(err)}`, 500);
  }
};
