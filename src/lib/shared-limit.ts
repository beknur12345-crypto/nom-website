import 'server-only';
import { and, count, eq, gt, lt, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getDb } from '@/db';
import { rateEvents } from '@/db/schema';

/**
 * Rate limits stored in the database, so they hold across every Vercel
 * instance (an in-memory counter resets whenever a new instance starts).
 * Without a database (test mode) every check passes. If the database call
 * fails, the check also passes (the per-instance limiter still applies), so a
 * database problem never blocks orders or the owner's login.
 */
export type LimitKind = 'login-fail' | 'order' | 'contact';

const since = (windowMs: number) => sql`now() - make_interval(secs => ${windowMs / 1000})`;

/** How many events of this kind happened in the window, for one key or for everyone. */
export async function recentCount(kind: LimitKind, windowMs: number, key?: string): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  try {
    const [row] = await db
      .select({ n: count() })
      .from(rateEvents)
      .where(
        and(
          eq(rateEvents.kind, kind),
          gt(rateEvents.at, since(windowMs)),
          key ? eq(rateEvents.key, key) : undefined,
        ),
      );
    return row?.n ?? 0;
  } catch (err) {
    console.error('[rate-limit] count failed, allowing:', err);
    return 0;
  }
}

export async function record(kind: LimitKind, key: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(rateEvents).values({ kind, key });
    // Occasionally clear out old rows so the table stays tiny.
    if (Math.random() < 0.05) await db.delete(rateEvents).where(lt(rateEvents.at, since(24 * 60 * 60_000)));
  } catch (err) {
    console.error('[rate-limit] record failed:', err);
  }
}

/** The visitor's IP. Vercel overwrites X-Forwarded-For, so it cannot be spoofed there. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}
