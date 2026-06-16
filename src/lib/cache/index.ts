import { CACHE_TTL } from '@/lib/constants';

const PREFIX = {
  BAZI: 'bazi:',
  REPORT_FREE: 'rpt:free:',
  REPORT_FULL: 'rpt:full:',
  OG_IMAGE: 'og:',
  IDEMPOTENT: 'idem:',
  LOCK: 'lock:',
  NONCE: 'nonce:',
} as const;

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function isExpired(entry: CacheEntry<unknown>): boolean {
  return entry.expiry > 0 && Date.now() > entry.expiry;
}

let redisClient: import('@upstash/redis').Redis | null | undefined = undefined;

async function getRedis(): Promise<import('@upstash/redis').Redis | null> {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.REDIS_URL;
  if (!url || !url.startsWith('https://')) {
    redisClient = null;
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis({ url, token: process.env.REDIS_TOKEN ?? '' });
  } catch {
    redisClient = null;
  }
  return redisClient;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const r = await getRedis();
    if (r) {
      return r.get<T>(key);
    }
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (isExpired(entry)) {
      memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  },

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    const r = await getRedis();
    if (r) {
      await r.set(key, data, { ex: ttlSeconds });
      return;
    }
    memoryCache.set(key, {
      data,
      expiry: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0,
    });
  },

  async del(key: string): Promise<void> {
    const r = await getRedis();
    if (r) {
      await r.del(key);
      return;
    }
    memoryCache.delete(key);
  },

  async exists(key: string): Promise<boolean> {
    const r = await getRedis();
    if (r) {
      return (await r.exists(key)) === 1;
    }
    const entry = memoryCache.get(key);
    if (!entry) return false;
    if (isExpired(entry)) {
      memoryCache.delete(key);
      return false;
    }
    return true;
  },

  async getOrSet<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const data = await fn();
    await this.set(key, data, ttlSeconds);
    return data;
  },

  buildKey(prefix: keyof typeof PREFIX, ...parts: string[]): string {
    return `${PREFIX[prefix]}${parts.join(':')}`;
  },

  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const r = await getRedis();
    if (r) {
      const result = await r.set(`lock:${key}`, '1', {
        ex: ttlSeconds,
        nx: true,
      });
      return result !== null;
    }
    const lockKey = `lock:${key}`;
    const exists = await this.exists(lockKey);
    if (exists) return false;
    await this.set(lockKey, '1', ttlSeconds);
    return true;
  },

  async releaseLock(key: string): Promise<void> {
    await this.del(`lock:${key}`);
  },

  async checkNonce(nonce: string): Promise<boolean> {
    const r = await getRedis();
    if (r) {
      const key = `nonce:${nonce}`;
      const result = await r.set(key, '1', {
        ex: CACHE_TTL.NONCE,
        nx: true,
      });
      return result !== null;
    }
    const key = `nonce:${nonce}`;
    const exists = await this.exists(key);
    if (exists) return false;
    await this.set(key, '1', CACHE_TTL.NONCE);
    return true;
  },
};
