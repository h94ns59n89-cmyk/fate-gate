import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { birth_info_id, report_type, idempotency_key } = body;

  if (!birth_info_id) {
    return error(100104, '缺少必填字段: birth_info_id', 400);
  }

  const idempotentKey = `idem:report:${idempotency_key}`;
  const existing = await cache.get(idempotentKey);
  if (existing) {
    return success(existing);
  }

  const birthInfo = await prisma.birthInfo.findUnique({
    where: { id: BigInt(birth_info_id) },
  });

  if (!birthInfo) {
    return error(300102, '出生信息不存在', 404);
  }

  const report = await prisma.personalityReport.create({
    data: {
      userId: birthInfo.userId,
      birthInfoId: birthInfo.id,
      reportType: report_type === 'paid' ? 'PAID' : 'FREE',
      status: 'PENDING',
      baziJson: {},
    },
  });

  const response = {
    report_id: Number(report.id),
    status: 'pending',
    poll_url: `/api/v1/reports/${report.id}/status`,
    estimated_wait_ms: 3000,
  };

  await cache.set(idempotentKey, response, CACHE_TTL.IDEMPOTENT);

  return success(response, 202);
});
