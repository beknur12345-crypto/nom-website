import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { env } from './env';

const COOKIE = 'admin_session';
const MAX_AGE_S = 30 * 24 * 60 * 60;

export const isAdminConfigured = () => Boolean(env.ADMIN_PASSWORD);

/** Changing ADMIN_PASSWORD (without a separate secret) signs everyone out. */
function key(): string {
  return env.ADMIN_SESSION_SECRET ?? createHash('sha256').update(`admin:${env.ADMIN_PASSWORD}`).digest('hex');
}

const sign = (payload: string) => createHmac('sha256', key()).update(payload).digest('base64url');

function safeEqual(a: string, b: string): boolean {
  // Hash first so lengths always match and nothing leaks through timing.
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  return isAdminConfigured() && safeEqual(input, env.ADMIN_PASSWORD!);
}

export async function createSession(): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const payload = String(exp);
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_S,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** True when the request carries a valid, unexpired admin session. */
export const isSignedIn = cache(async (): Promise<boolean> => {
  if (!isAdminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [payload, sig] = value.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  return Number(payload) > Date.now() / 1000;
});

/** Guard for server actions and route handlers. */
export async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) throw new Error('Unauthorized');
}
