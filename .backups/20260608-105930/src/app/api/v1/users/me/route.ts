import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';

export const GET = withMiddleware(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return error(200102, 'Token 无效', 401);
  }

  return success({
    id: 10001,
    nickname: '用户',
    avatar_url: null,
    is_new_user: false,
    has_report: true,
    report_count: 3,
  });
});
