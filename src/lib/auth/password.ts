import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const sep = stored.indexOf(':');
  if (sep === -1) return false;
  const salt = stored.slice(0, sep);
  const hash = stored.slice(sep + 1);
  const derived = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(derived), Buffer.from(hash));
}
