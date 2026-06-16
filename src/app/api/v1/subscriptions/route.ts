import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { PRODUCT_PRICES } from '@/lib/constants';
import { Logger } from '@/lib/logger';
import { generateOrderNo } from '@/lib/utils';
import { createUnifiedOrder, getJsApiParams } from '@/lib/payment';
import { getEnv } from '@/lib/env';
import { subscriptionsCreateSchema } from '@/lib/validation';

async function tryPersistOrder(order: Record<string, unknown>): Promise<boolean> {
  try {
    const prisma = (await import('@/lib/db/client')).default;
    await prisma.order.create({ data: order as never });
    return true;
  } catch (err) {
    Logger.for('subscriptions').warn('DB unavailable, using transient order', { error: (err as Error)?.message });
    return false;
  }
}

export const POST = withMiddleware(async (req) => {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = subscriptionsCreateSchema.safeParse(body);
  if (!parsed.success) {
    return error(100104, parsed.error?.issues?.[0]?.message ?? '参数校验失败', 400);
  }
  const { plan_type } = parsed.data;

  const priceKey = plan_type === 'MONTHLY' ? 'SUBSCRIPTION_MONTHLY'
    : plan_type === 'QUARTERLY' ? 'SUBSCRIPTION_MONTHLY'
    : 'SUBSCRIPTION_YEARLY';
  const price = PRODUCT_PRICES[priceKey as keyof typeof PRODUCT_PRICES];
  if (!price) {
    return error(400103, '金额异常', 400);
  }

  const prisma = (await import('@/lib/db/client')).default;
  const user = await prisma.user.findUnique({ where: { id: BigInt(auth.userId) } });
  if (!user?.wechatOpenid) {
    return error(200102, '请先完成微信登录后再支付', 402);
  }

  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: BigInt(auth.userId),
      planType: plan_type,
      status: 'ACTIVE',
    },
  });
  if (existingSub) {
    return success({
      id: Number(existingSub.id),
      plan_type: existingSub.planType.toLowerCase(),
      status: existingSub.status.toLowerCase(),
      message: '已有有效订阅',
    });
  }

  const orderNo = generateOrderNo();
  await tryPersistOrder({
    orderNo,
    userId: BigInt(auth.userId),
    productType: priceKey,
    productName: `订阅-${plan_type}`,
    amount: price,
    finalAmount: price,
  });

  const env = getEnv();
  const { prepayId } = await createUnifiedOrder({
    outTradeNo: orderNo,
    totalFee: price,
    description: `星隅订阅-${plan_type}`,
    openid: user.wechatOpenid,
    notifyUrl: env.wechat.notifyUrl,
  });

  const payParams = getJsApiParams(prepayId);

  return success({
    order_no: orderNo,
    amount: price,
    pay_params: payParams,
    plan_type: plan_type.toLowerCase(),
    expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
});
