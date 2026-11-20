/**
 * Pure helpers that turn a raw page view into the coarse, anonymous fields
 * stored in the `visits` table. Kept free of server imports so they are easy to test.
 */

export type Device = 'mobile' | 'tablet' | 'desktop';

/** Crawlers, link previews (Facebook, Telegram…) and automated browsers are not visitors. */
const BOT =
  /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|preview|headless|lighthouse|pingdom|curl|wget|python|httpclient|playwright/i;

export const isBot = (ua: string): boolean => !ua || BOT.test(ua);

export function deviceOf(ua: string): Device {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** Well-known sources, matched against the referring host. */
const KNOWN: [RegExp, string][] = [
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(t\.me|telegram\.org|telegram\.me)$/, 'telegram'],
  [/(^|\.)google\.[a-z.]+$/, 'google'],
  [/(^|\.)(bing\.com|yandex\.[a-z]+|duckduckgo\.com)$/, 'search'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
];

/**
 * Where the visitor came from: a known name, another site's host, or "direct".
 * Facebook's in-app browser often hides the referrer, but it adds `fbclid` to links.
 */
export function sourceOf({
  referrer,
  siteHost,
  query,
}: {
  referrer: string;
  siteHost: string;
  query: string;
}): string {
  const params = new URLSearchParams(query);
  const utm = params.get('utm_source')?.trim().toLowerCase();
  if (params.has('fbclid')) return 'facebook';
  let host = '';
  try {
    host = referrer ? new URL(referrer).hostname.toLowerCase().replace(/^www\./, '') : '';
  } catch {
    host = '';
  }
  const own = siteHost.toLowerCase().replace(/^www\./, '');
  if (host && host !== own && !host.endsWith('.vercel.app')) {
    for (const [re, name] of KNOWN) if (re.test(host)) return name;
    return host.slice(0, 80);
  }
  if (utm) {
    for (const [re, name] of KNOWN) if (re.test(`${utm}.com`) || utm === name) return name;
    return utm.slice(0, 40);
  }
  return 'direct';
}

/** Keeps only the path (no query or hash, which could carry personal data), capped in length. */
export function cleanPath(path: string): string | null {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return null;
  const p = path.split(/[?#]/)[0]!.slice(0, 200);
  if (p.startsWith('/admin') || p.startsWith('/api')) return null;
  return p;
}

/** Day in Ulaanbaatar time, as YYYY-MM-DD. */
export const ubDay = (d: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ulaanbaatar' }).format(d);
