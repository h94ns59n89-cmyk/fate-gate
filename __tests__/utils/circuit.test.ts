import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkCircuit,
  recordSuccess,
  recordFailure,
  getCircuitState,
  resetCircuit,
} from '@/lib/circuit';

describe('Circuit Breaker', () => {
  beforeEach(() => {
    resetCircuit('test-service');
  });

  it('should start in CLOSED state', () => {
    expect(getCircuitState('test-service')).toBe('CLOSED');
  });

  it('should allow requests when CLOSED', () => {
    expect(checkCircuit('test-service')).toBe(true);
  });

  it('should open after threshold failures', () => {
    for (let i = 0; i < 5; i++) {
      recordFailure('test-service');
    }
    expect(getCircuitState('test-service')).toBe('OPEN');
    expect(checkCircuit('test-service')).toBe(false);
  });

  it('should reset after successful calls', () => {
    for (let i = 0; i < 5; i++) {
      recordSuccess('test-service');
    }
    expect(getCircuitState('test-service')).toBe('CLOSED');
  });
});
