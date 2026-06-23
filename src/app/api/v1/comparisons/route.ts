import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';
import { generateComparison } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { user_id, target_user_id, user_bazi, target_bazi, target_tags, user_tags } = body;

  if (!target_bazi || !user_bazi) {
    return error(100104, '缺少 target_bazi 或 user_bazi', 400);
  }

  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();

  const result = await generateComparison(target_bazi as Record<string, unknown>, user_bazi as Record<string, unknown>, { trace });

  if (!result.data) {
    return error(100500, 'AI 对比生成失败', 500);
  }

  const { overall_match, dimensions, complementarity, strengths, potential_conflicts, advice, summary_tag } = result.data;

  const comparison = await prisma.comparison.create({
    data: {
      userId: user_id ? Number(user_id) : Number(0),
      targetUserId: target_user_id ? Number(target_user_id) : null,
      matchScore: overall_match,
      dimensionsJson: dimensions as never,
      adviceJson: {
        complementarity,
        strengths,
        potential_conflicts,
        advice,
        target_tags: target_tags ?? [],
        user_tags: user_tags ?? [],
        summary_tag,
      } as never,
      isPaid: false,
    },
  });

  return success({
    id: Number(comparison.id),
    match_score: comparison.matchScore,
    dimensions: comparison.dimensionsJson,
    advice: typeof advice === 'string' ? advice : '',
    complementarity: typeof complementarity === 'string' ? complementarity : '',
    strengths: Array.isArray(strengths) ? strengths : [],
    potential_conflicts: Array.isArray(potential_conflicts) ? potential_conflicts : [],
    summary_tag: typeof summary_tag === 'string' ? summary_tag : '缘分天定',
  });
});
