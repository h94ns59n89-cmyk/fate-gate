import { withMiddleware } from '@/lib/middleware';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  await req.text();

  const orderNo = 'FG' + Date.now().toString(36).toUpperCase();

  const existingOrder = await prisma.order.findUnique({
    where: { transactionId: 'mock_transaction_id' },
  });
  if (existingOrder) {
    return new Response('<xml><return_code>SUCCESS</return_code></xml>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  await prisma.order.updateMany({
    where: { orderNo, status: 'PENDING' },
    data: {
      status: 'PAID',
      transactionId: 'mock_transaction_id',
      paidAt: new Date(),
    },
  });

  return new Response('<xml><return_code>SUCCESS</return_code></xml>', {
    headers: { 'Content-Type': 'application/xml' },
  });
});
