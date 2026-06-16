import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';
import { shareRecordsSchema } from '@/lib/validation';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const parsed = shareRecordsSchema.safeParse(body);
  if (!parsed.success) {
    return error(100104, parsed.error?.issues?.[0]?.message ?? '参数校验失败', 400);
  }
  const { user_id, share_type, platform } = parsed.data;

  const record = await prisma.sharingRecord.create({
    data: {
      userId: BigInt(user_id),
      shareType: share_type,
      platform: platform ?? 'h5',
    },
  });

  return success({
    id: Number(record.id),
    message: '分享记录已保存',
  });
});
