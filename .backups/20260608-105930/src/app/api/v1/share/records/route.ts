import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { user_id, share_type, platform } = body;

  if (!user_id || !share_type) {
    return error(100104, '缺少必填字段', 400);
  }

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
