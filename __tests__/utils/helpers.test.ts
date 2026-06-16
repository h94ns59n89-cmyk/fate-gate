import { describe, it, expect } from 'vitest';
import { generateOrderNo, sha256, maskString } from '@/lib/utils';
import { HOUR_LABELS, HEAVENLY_STEMS, EARTHLY_BRANCHES, FIVE_ELEMENTS } from '@/lib/constants';

describe('Utils', () => {
  it('generateOrderNo should have correct prefix', () => {
    const orderNo = generateOrderNo();
    expect(orderNo).toMatch(/^FG\d{6}[A-Z0-9]{8}$/);
  });

  it('sha256 should produce consistent hashes', () => {
    const hash1 = sha256('test');
    const hash2 = sha256('test');
    const hash3 = sha256('different');
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('maskString should mask middle portion', () => {
    const result = maskString('13800138000', 3, 4);
    expect(result).toMatch(/^138\*{4}8000$/);
  });
});

describe('Constants', () => {
  it('should have 12 hour labels', () => {
    expect(HOUR_LABELS.length).toBe(12);
  });

  it('should have 10 heavenly stems', () => {
    expect(HEAVENLY_STEMS.length).toBe(10);
  });

  it('should have 12 earthly branches', () => {
    expect(EARTHLY_BRANCHES.length).toBe(12);
  });

  it('should have 5 elements', () => {
    expect(FIVE_ELEMENTS.length).toBe(5);
  });
});
