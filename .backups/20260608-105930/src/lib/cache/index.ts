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

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (isExpired(entry)) {
      memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  },

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    memoryCache.set(key, {
      data,
      expiry: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0,
    });
  },

  async del(key: string): Promise<void> {
    memoryCache.delete(key);
  },

  async exists(key: string): Promise<boolean> {
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
    const lockKey = `${PREFIX.LOCK}${key}`;
    const exists = await this.exists(lockKey);
    if (exists) return false;
    await this.set(lockKey, '1', ttlSeconds);
    return true;
  },

  async releaseLock(key: string): Promise<void> {
    await this.del(`${PREFIX.LOCK}${key}`);
  },

  async checkNonce(nonce: string): Promise<boolean> {
    const key = `${PREFIX.NONCE}${nonce}`;
    const exists = await this.exists(key);
    if (exists) return false;
    await this.set(key, '1', CACHE_TTL.NONCE);
    return true;
  },
};
