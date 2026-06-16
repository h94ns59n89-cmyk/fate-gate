import { describe, it, expect } from 'vitest';
import { generateTraceId, generateSpanId, createTraceContext, createChildSpan } from '@/lib/trace';

describe('Trace', () => {
  it('should generate trace ID with correct prefix', () => {
    const traceId = generateTraceId();
    expect(traceId).toMatch(/^trace_/);
    expect(traceId.length).toBeGreaterThan(16);
  });

  it('should generate span IDs', () => {
    const spanId = generateSpanId();
    expect(spanId.length).toBe(16);
  });

  it('should create trace context', () => {
    const ctx = createTraceContext();
    expect(ctx.traceId).toBeTruthy();
    expect(ctx.spanId).toBeTruthy();
    expect(ctx.parentSpanId).toBeUndefined();
  });

  it('should create child spans with parent reference', () => {
    const parent = createTraceContext();
    const child = createChildSpan(parent);
    expect(child.traceId).toBe(parent.traceId);
    expect(child.parentSpanId).toBe(parent.spanId);
  });
});
