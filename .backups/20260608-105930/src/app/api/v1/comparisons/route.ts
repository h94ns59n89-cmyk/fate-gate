import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { user_id, target_bazi, user_bazi } = body;

  if (!user_bazi || !target_bazi) {
    return error(100104, '缺少双方八字数据', 400);
  }

  const comparison = await prisma.comparison.create({
    data: {
      userId: BigInt(user_id ?? 0),
      matchScore: 85,
      dimensionsJson: {
        communication: 80,
        emotional: 75,
        values: 90,
        growth: 85,
      },
      adviceJson: {
        complementarity: '木生火，你的创造力滋养了TA的执行力',
        strengths: ['五行互补', '价值观一致', '沟通顺畅'],
        potential_conflicts: ['火旺易急躁', '水弱需沟通'],
      },
      isPaid: false,
    },
  });

  return success({
    id: Number(comparison.id),
    match_score: comparison.matchScore,
    dimensions: comparison.dimensionsJson,
    advice: comparison.adviceJson,
    summary_tag: '木火相生·最佳拍档',
  });
});
