import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export function getOrSetUserIdCookie(): string {
  const store = cookies();
  const existing = store.get('uid')?.value;
  if (existing) return existing;
  const uid = randomUUID();
  // Note: Route handlers can also set cookies on NextResponse, but for simplicity
  // we set a cookie via header API here (Next 14 supports mutation in server actions/handlers).
  store.set('uid', uid, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  return uid;
}

