import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL, PRODUCT_PRICES } from '@/lib/constants';
import { generateOrderNo, generateUUID } from '@/lib/utils';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { report_id, product_type, idempotency_key } = body;

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
  await prisma.order.create({
    data: {
      orderNo,
      userId: BigInt(body.user_id ?? 0),
      reportId: report_id ? BigInt(report_id) : null,
      productType: product_type,
      productName: product_type,
      amount: price,
      finalAmount: price,
      idempotencyKey: idempotency_key,
    },
  });

  const payParams = {
    appId: 'wx1234567890',
    timeStamp: Math.floor(Date.now() / 1000).toString(),
    nonceStr: generateUUID(),
    package: `prepay_id=mock_${orderNo}`,
    signType: 'RSA' as const,
    paySign: 'MOCK_SIGN',
  };

  const response = {
    order_no: orderNo,
    amount: price,
    pay_params: payParams,
    expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };

  await cache.set(idempotentKey, response, CACHE_TTL.IDEMPOTENT);
  return success(response);
});
