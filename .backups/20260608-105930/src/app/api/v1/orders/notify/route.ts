import { withMiddleware } from '@/lib/middleware';
import prisma from '@/lib/db/client';
import { verifyNotify, successXmlResponse, failXmlResponse } from '@/lib/payment';

export const POST = withMiddleware(async (req) => {
  const xml = await req.text();
  const result = verifyNotify(xml);

  if (!result) {
    return failXmlResponse('签名验证失败');
  }

  const { outTradeNo, transactionId } = result;

  const existingOrder = await prisma.order.findUnique({
    where: { transactionId },
  });
  if (existingOrder) {
    return successXmlResponse();
  }

  const updated = await prisma.order.updateMany({
    where: { orderNo: outTradeNo, status: 'PENDING' },
    data: {
      status: 'PAID',
      transactionId,
      paidAt: new Date(),
    },
  });

  if (updated.count === 0) {
    return failXmlResponse('订单不存在或已处理');
  }

  return successXmlResponse();
});
