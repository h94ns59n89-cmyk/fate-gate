import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { checkAdminToken } from '@/lib/admin-auth';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { token } = body;
  if (checkAdminToken(token ?? '')) {
    return success({ valid: true });
  }
  return error(401, '密码错误', 401);
});
