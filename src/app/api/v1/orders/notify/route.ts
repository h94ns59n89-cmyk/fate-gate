import { withMiddleware } from '@/lib/middleware';
import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import { Logger } from '@/lib/logger';
import prisma from '@/lib/db/client';
import { verifyNotify, successXmlResponse, failXmlResponse } from '@/lib/payment';

export const POST = withMiddleware(async (req) => {
  const xml = await req.text();
  const result = verifyNotify(xml);

  if (!result) {
    return failXmlResponse('签名验证失败');
  }

  const { outTradeNo, transactionId } = result;

  // Nonce replay protection: transactionId doubles as unique nonce
  const nonceOk = await cache.checkNonce(`notify:${transactionId}`);
  if (!nonceOk) {
    return successXmlResponse();
  }

  const existingOrder = await prisma.order.findUnique({
    where: { transactionId },
  });
  if (existingOrder) {
    await cache.set(`notify:${transactionId}`, '1', CACHE_TTL.NONCE);
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

  // Mark associated report as PAID if this is a FULL_REPORT order
  try {
    const order = await prisma.order.findUnique({ where: { orderNo: outTradeNo } });
    if (order?.reportId) {
      await prisma.personalityReport.update({
        where: { id: order.reportId },
        data: { reportType: 'PAID' },
      });
    }
  } catch (err) {
    Logger.for('notify').warn('Failed to update report type', { error: (err as Error)?.message });
  }

  return successXmlResponse();
});
