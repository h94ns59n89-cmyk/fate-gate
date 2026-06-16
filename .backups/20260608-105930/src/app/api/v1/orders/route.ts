import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL, PRODUCT_PRICES } from '@/lib/constants';
import { generateOrderNo } from '@/lib/utils';
import { createUnifiedOrder, getJsApiParams } from '@/lib/payment';
import { getEnv } from '@/lib/env';

async function tryPersistOrder(order: Record<string, unknown>): Promise<boolean> {
  try {
    const prisma = (await import('@/lib/db/client')).default;
    await prisma.order.create({ data: order as never });
    return true;
  } catch (err) {
    console.warn('[Orders] DB unavailable, using transient order:', (err as Error)?.message);
    return false;
  }
}

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { report_id, product_type, idempotency_key, openid } = body;

  if (!idempotency_key) {
    return error(100104, '缺少幂等键', 400);
  }

  const idempotentKey = `idem:order:${idempotency_key}`;
  const existing = await cache.get(idempotentKey);
  if (existing) return success(existing);

  const price = PRODUCT_PRICES[product_type as keyof typeof PRODUCT_PRICES];
  if (!price) {
    return error(400103, '金额异常', 400);
  }

  const orderNo = generateOrderNo();

  await tryPersistOrder({
    orderNo,
    userId: BigInt(body.user_id ?? 0),
    reportId: report_id ? BigInt(report_id) : null,
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
    description: product_type === 'FULL_REPORT' ? '完整命理人格报告' : '命理合盘对比',
    openid: openid ?? 'mock_openid',
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
