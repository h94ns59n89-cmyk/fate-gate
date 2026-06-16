import { NextResponse } from 'next/server';
import { withMiddleware, requireAuth } from '@/lib/middleware';
import { success } from '@/lib/api-response';

export const GET = withMiddleware(async (req) => {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  return success({
    id: auth.userId,
    nickname: '用户',
    avatar_url: null,
    is_new_user: false,
    has_report: true,
    report_count: 3,
  });
});
