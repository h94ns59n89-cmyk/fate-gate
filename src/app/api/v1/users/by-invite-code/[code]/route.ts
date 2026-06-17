import { withMiddleware } from '@/lib/middleware';
import { success, notFound } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req, { params }) => {
  const code = params.code ?? '';
  const userId = parseInt(code.replace(/^u_?/i, ''), 10);
  if (!userId || isNaN(userId)) return notFound('邀请码无效');

  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: { id: true, nickname: true, avatarUrl: true },
  });
  if (!user) return notFound('用户不存在');

  const report = await prisma.personalityReport.findFirst({
    where: { userId: BigInt(userId), status: 'COMPLETED', reportType: 'FREE' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, personalityTags: true, baziJson: true },
  });
  if (!report) return notFound('该用户尚未生成报告');

  return success({
    user_id: Number(user.id),
    nickname: user.nickname,
    avatar_url: user.avatarUrl,
    report_id: Number(report.id),
    personality_tags: report.personalityTags,
    bazi: report.baziJson,
  });
});
