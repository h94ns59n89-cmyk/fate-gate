import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/lib/logger';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export function generateTraceId(): string {
  return `trace_${uuidv4().replace(/-/g, '').substring(0, 24)}`;
}

export function generateSpanId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 16);
}

export function createTraceContext(parentTraceId?: string): TraceContext {
  return {
    traceId: parentTraceId ?? generateTraceId(),
    spanId: generateSpanId(),
  };
}

export function createChildSpan(parent: TraceContext): TraceContext {
  return {
    traceId: parent.traceId,
    spanId: generateSpanId(),
    parentSpanId: parent.spanId,
  };
}

export function getTraceFromHeaders(
  reqHeaders: Headers | { get: (name: string) => string | null },
): TraceContext | null {
  const traceId = reqHeaders.get('X-Trace-Id');
  const spanId = reqHeaders.get('X-Span-Id');
  if (!traceId) return null;
  return {
    traceId,
    spanId: spanId ?? generateSpanId(),
  };
}

export function recordSpan(
  trace: TraceContext,
  spanName: string,
  durationMs: number,
  attributes?: Record<string, unknown>,
) {
  Logger.for('web', trace).info(`span:${spanName}`, {
    span: spanName,
    duration_ms: durationMs,
    parent_span_id: trace.parentSpanId,
    ...attributes,
  });
}

export async function traceAsync<T>(
  trace: TraceContext,
  spanName: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    recordSpan(trace, spanName, Date.now() - start, { status: 'OK' });
    return result;
  } catch (error) {
    recordSpan(trace, spanName, Date.now() - start, {
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
