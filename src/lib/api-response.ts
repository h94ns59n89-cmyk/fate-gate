import { NextResponse } from 'next/server';
import { generateTraceId } from '@/lib/trace';
import type { ApiResponse } from '@/lib/types';

export function success<T>(data: T, status: number = 200, requestId?: string): NextResponse {
  const response: ApiResponse<T> = {
    code: 0,
    message: 'success',
    request_id: requestId ?? generateTraceId(),
    timestamp: Date.now(),
    data,
  };
  return NextResponse.json(response, { status });
}

export function error(
  code: number,
  message: string,
  httpStatus: number = 400,
  detail?: Record<string, unknown>,
  requestId?: string,
): NextResponse {
  const response: ApiResponse = {
    code,
    message,
    request_id: requestId ?? generateTraceId(),
    timestamp: Date.now(),
    data: null,
    ...(detail ? { detail } : {}),
  };
  return NextResponse.json(response, { status: httpStatus });
}

export function created<T>(data: T, requestId?: string): NextResponse {
  return success(data, 201, requestId);
}

export function accepted<T>(data: T, requestId?: string): NextResponse {
  return success(data, 202, requestId);
}

export function notFound(message: string = '资源不存在', requestId?: string): NextResponse {
  return error(300102, message, 404, undefined, requestId);
}
