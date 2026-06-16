import { withMiddleware } from '@/lib/middleware';
import { success, notFound } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req, { params }) => {
  const id = parseInt(params.id ?? '0', 10);
  if (!id) return notFound('对比不存在');

  const comparison = await prisma.comparison.findUnique({
    where: { id: BigInt(id) },
  });

  if (!comparison) return notFound('对比不存在');

  return success({
    id: Number(comparison.id),
    match_score: comparison.matchScore,
    dimensions: comparison.dimensionsJson,
    advice: comparison.adviceJson,
    share_image_url: comparison.shareImageUrl,
    is_paid: comparison.isPaid,
  });
});
