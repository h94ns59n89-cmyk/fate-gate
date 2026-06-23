import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL, PRODUCT_PRICES } from '@/lib/constants';
import { Logger } from '@/lib/logger';
import { generateOrderNo } from '@/lib/utils';
import { getEnv } from '@/lib/env';
import { createUnifiedOrder, getJsApiParams } from '@/lib/payment';
import { ordersCreateSchema } from '@/lib/validation';

async function tryPersistOrder(order: Record<string, unknown>): Promise<boolean> {
  try {
    const prisma = (await import('@/lib/db/client')).default;
    await prisma.order.create({ data: order as never });
    return true;
  } catch (err) {
    Logger.for('orders').warn('DB unavailable, using transient order', { error: (err as Error)?.message });
    return false;
  }
}

export const POST = withMiddleware(async (req) => {
  let userId: number;

  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) {
    const body = await req.clone().json();
    if (!body.user_id) return auth;
    userId = body.user_id;
  } else {
    userId = auth.userId;
  }

  const body = await req.json();
  const parsed = ordersCreateSchema.safeParse(body);
  if (!parsed.success) {
    return error(100104, parsed.error?.issues?.[0]?.message ?? '参数校验失败', 400);
  }
  const { report_id, product_type, idempotency_key } = parsed.data;

  const idempotentKey = `idem:order:${idempotency_key}`;
  const existing = await cache.get(idempotentKey);
  if (existing) return success(existing);

  const price = PRODUCT_PRICES[product_type as keyof typeof PRODUCT_PRICES];
  if (!price) {
    return error(400103, '金额异常', 400);
  }

  const isMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true' || !getEnv().wechat.apiKey;
  let openid: string;
  if (isMock) {
    openid = `mock_openid_${userId}`;
  } else {
    const prisma = (await import('@/lib/db/client')).default;
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user?.wechatOpenid) {
      return error(200102, '请先完成微信登录后再支付', 402);
    }
    openid = user.wechatOpenid;
  }

  const orderNo = generateOrderNo();

  await tryPersistOrder({
    orderNo,
    userId: Number(userId),
    reportId: report_id ? Number(report_id) : null,
    productType: product_type,
    productName: product_type,
    amount: price,
    finalAmount: price,
    idempotencyKey: idempotency_key,
  });

  const env = getEnv();
  const { prepayId } = await createUnifiedOrder({
    outTradeNo: orderNo,
    totalFee: price,
    description: product_type === 'FULL_REPORT' ? '完整星隅报告' : '星隅合盘对比',
    openid,
    notifyUrl: env.wechat.notifyUrl,
  });

  const payParams = getJsApiParams(prepayId);

  const response = {
    order_no: orderNo,
    amount: price,
    pay_params: payParams,
    expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };

  await cache.set(idempotentKey, response, CACHE_TTL.IDEMPOTENT);
  return success(response);
});
