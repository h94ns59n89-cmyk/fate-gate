import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { error as apiError } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';

export async function checkRateLimit(
  req: Request,
  dimension: string,
  maxRequests: number = 30,
): Promise<boolean> {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const key = `rl:${dimension}:${ip}`;
  const count = (await cache.get<number>(key)) ?? 0;
  if (count >= maxRequests) return false;
  await cache.set(key, count + 1, 1);
  return true;
}

export async function requireAuth(req: Request): Promise<{ userId?: number } | NextResponse> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return apiError(200102, 'Token 无效', 401);
  }
  return { userId: 1 };
}

export function getRequestId(req: Request): string {
  return req.headers.get('X-Request-Id') ?? crypto.randomUUID();
}

export function withMiddleware(
  handler: (req: Request, context: { params: Record<string, string> }) => Promise<Response>,
) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      const limited = await checkRateLimit(req, 'api');
      if (!limited) {
        return apiError(429001, '请求过于频繁，请稍后再试', 429);
      }
      const resolvedParams = await context.params;
      return await handler(req, { params: resolvedParams });
    } catch (err) {
      if (err instanceof ApiError) {
        return apiError(err.code, err.message, err.httpStatus);
      }
      return apiError(500000, '服务器内部错误', 500);
    }
  };
}
