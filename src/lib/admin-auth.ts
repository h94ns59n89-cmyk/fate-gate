export function extractAdminToken(req: Request): string {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return '';
}

export function checkAdminToken(token: string): boolean {
  const expected = process.env.ADMIN_TOKEN ?? '';
  return token !== '' && token === expected;
}
