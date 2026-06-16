import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';
import { comparisonsCreateSchema } from '@/lib/validation';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const parsed = comparisonsCreateSchema.safeParse(body);
  if (!parsed.success) {
    return error(100104, parsed.error?.issues?.[0]?.message ?? '参数校验失败', 400);
  }
  const { user_id } = parsed.data;

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
