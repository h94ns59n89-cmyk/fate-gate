import { withMiddleware } from '@/lib/middleware';
import { success, notFound } from '@/lib/api-response';
import prisma from '@/lib/db/client';

export const GET = withMiddleware(async (req, { params }) => {
  const { orderNo } = params;
  if (!orderNo) return notFound('订单不存在');

  const order = await prisma.order.findUnique({
    where: { orderNo },
  });

  if (!order) return notFound('订单不存在');

  return success({
    order_no: order.orderNo,
    amount: order.amount,
    final_amount: order.finalAmount,
    status: order.status.toLowerCase(),
    product_type: order.productType.toLowerCase(),
    paid_at: order.paidAt?.toISOString() ?? null,
    created_at: order.createdAt.toISOString(),
  });
});
