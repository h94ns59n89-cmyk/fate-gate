import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { user_id, plan_type } = body;

  if (!user_id || !plan_type) {
    return error(100104, '缺少必填字段', 400);
  }

  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: BigInt(user_id),
      planType: plan_type,
      status: 'ACTIVE',
    },
  });

  if (existingSub) {
    return success({
      id: Number(existingSub.id),
      message: '已有有效订阅',
    });
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const subscription = await prisma.subscription.create({
    data: {
      userId: BigInt(user_id),
      planType: plan_type,
      status: 'ACTIVE',
      startDate: now,
      endDate,
      autoRenew: true,
    },
  });

  return success({
    id: Number(subscription.id),
    plan_type: subscription.planType.toLowerCase(),
    status: subscription.status.toLowerCase(),
    start_date: subscription.startDate.toISOString(),
    end_date: subscription.endDate.toISOString(),
  });
});
