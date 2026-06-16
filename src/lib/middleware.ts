import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { error as apiError } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';
import { verifyJWT } from '@/lib/auth/jwt';
import { RATE_LIMITS } from '@/lib/constants';

interface RateLimitConfig {
  window: number;
  max: number;
}

function getPathDimension(pathname: string): string {
  if (pathname.includes('/auth/')) return 'AUTH';
  if (pathname.includes('/bazi/')) return 'BAZI';
  if (pathname.includes('/report')) return 'REPORT';
  if (pathname.includes('/order')) return 'ORDER';
  return 'GLOBAL';
}

async function rateLimit(key: string, config: RateLimitConfig): Promise<{ limited: boolean; remaining: number; resetIn: number }> {
  const count = (await cache.get<number>(key)) ?? 0;
  const limited = count >= config.max;
  const ttl = count === 0 ? config.window : undefined;
  if (!limited) {
    await cache.set(key, count + 1, config.window);
  }
  return { limited, remaining: Math.max(0, config.max - count - 1), resetIn: config.window };
}

export async function checkRateLimit(
  req: Request,
  dimension: string,
  maxRequests?: number,
): Promise<boolean> {
  const config = maxRequests ? { window: 60, max: maxRequests } : RATE_LIMITS.IP;
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const key = `rl:${dimension}:${ip}`;
  const { limited } = await rateLimit(key, config);
  return !limited;
}

export async function requireAuth(req: Request): Promise<{ userId: number } | NextResponse> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return apiError(200102, 'Token 无效或已过期', 401);
  }
  const token = auth.slice(7);
  const payload = await verifyJWT(token);
  if (!payload) {
    return apiError(200102, 'Token 无效或已过期', 401);
  }
  return { userId: payload.userId };
}

export function getRequestId(req: Request): string {
  return req.headers.get('X-Request-Id') ?? crypto.randomUUID();
}

export function withMiddleware(
  handler: (req: Request, context: { params: Record<string, string> }) => Promise<Response>,
) {
  return async (req: Request, context: { params: Promise<Record<string, string>> }) => {
    try {
      const url = new URL(req.url);
      const dimension = getPathDimension(url.pathname);
      const dimConfig = RATE_LIMITS.API[dimension as keyof typeof RATE_LIMITS.API] ?? RATE_LIMITS.GLOBAL;

      const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
      const globalKey = `rl:global:${ip}`;
      const globalResult = await rateLimit(globalKey, RATE_LIMITS.GLOBAL);
      if (globalResult.limited) {
        return apiError(429001, '请求过于频繁，请稍后再试', 429);
      }

      const dimKey = `rl:${dimension}:${ip}`;
      const dimResult = await rateLimit(dimKey, dimConfig);
      if (dimResult.limited) {
        return apiError(429001, '请求过于频繁，请稍后再试', 429);
      }

      const resolvedParams = await context.params;
      const response = await handler(req, { params: resolvedParams });

      if (response instanceof NextResponse || response instanceof Response) {
        const headers = new Headers(response.headers);
        headers.set('X-RateLimit-Limit', String(dimConfig.max));
        headers.set('X-RateLimit-Remaining', String(dimResult.remaining));
        headers.set('X-RateLimit-Reset', String(Math.ceil(Date.now() / 1000) + dimConfig.window));
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }

      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        return apiError(err.code, err.message, err.httpStatus);
      }
      return apiError(500000, '服务器内部错误', 500);
    }
  };
}
