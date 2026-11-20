import { createHash } from 'node:crypto';
import { lt, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { visits } from '@/db/schema';
import { env } from '@/lib/env';
import { cleanPath, deviceOf, isBot, sourceOf, ubDay } from '@/lib/visit-classify';

/**
 * Records one page view, sent by the browser with navigator.sendBeacon.
 * Stores no IP address: the visitor id is a hash of IP, browser and today's
 * date with a server secret, so it changes daily and cannot be reversed.
 */
export async function POST(request: Request): Promise<Response> {
  const done = new Response(null, { status: 204 });
  const db = getDb();
  if (!db) return done;

  const ua = request.headers.get('user-agent') ?? '';
  if (isBot(ua)) return done;

  let body: { path?: unknown; referrer?: unknown; query?: unknown; internal?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done;
  }
  const path = cleanPath(String(body.path ?? ''));
  if (!path) return done;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const secret = env.ADMIN_SESSION_SECRET ?? env.ADMIN_PASSWORD ?? 'ulsturiintulaan';
  const visitor = createHash('sha256').update(`${secret}|${ubDay()}|${ip}|${ua}`).digest('hex').slice(0, 20);
  const country = request.headers.get('x-vercel-ip-country')?.slice(0, 2).toUpperCase() || null;

  try {
    await db.insert(visits).values({
      path,
      // Clicks inside the site are marked "internal" so they don't count as new arrivals.
      source:
        body.internal === true
          ? 'internal'
          : sourceOf({
              referrer: String(body.referrer ?? '').slice(0, 500),
              siteHost: new URL(request.url).hostname,
              query: String(body.query ?? '').slice(0, 500),
            }),
      country,
      device: deviceOf(ua),
      visitor,
    });
    // Now and then, drop views older than two years so the table stays small.
    if (Math.random() < 0.01) await db.delete(visits).where(lt(visits.at, sql`now() - interval '2 years'`));
  } catch (err) {
    console.error('[visit] record failed:', err);
  }
  return done;
}
