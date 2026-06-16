import { describe, it, expect, beforeEach } from 'vitest';
import { cache } from '@/lib/cache';

describe('Cache', () => {
  beforeEach(async () => {
    await cache.del('test-key');
  });

  it('should set and get values', async () => {
    await cache.set('test-key', { hello: 'world' }, 60);
    const value = await cache.get<{ hello: string }>('test-key');
    expect(value).toEqual({ hello: 'world' });
  });

  it('should return null for missing keys', async () => {
    const value = await cache.get('non-existent');
    expect(value).toBeNull();
  });

  it('should check existence', async () => {
    expect(await cache.exists('test-key')).toBe(false);
    await cache.set('test-key', 'value', 60);
    expect(await cache.exists('test-key')).toBe(true);
  });

  it('should delete values', async () => {
    await cache.set('test-key', 'value', 60);
    await cache.del('test-key');
    expect(await cache.exists('test-key')).toBe(false);
  });

  it('should set and get zero TTL', async () => {
    await cache.set('test-key', 'persistent', 0);
    const value = await cache.get('test-key');
    expect(value).toBe('persistent');
  });
});
