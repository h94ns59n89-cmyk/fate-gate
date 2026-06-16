import { SignJWT, jwtVerify } from 'jose';

export interface JwtPayload {
  userId: number;
  openidHash?: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production';
  return new TextEncoder().encode(secret);
}

export async function signJWT(payload: JwtPayload, expiresIn: number = 2592000): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getSecret());
}

export async function verifyJWT(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
