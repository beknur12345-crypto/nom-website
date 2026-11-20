import 'server-only';
import { and, count, gt, inArray, ne, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { articles, orders, visits } from '@/db/schema';

const TZ = 'Asia/Ulaanbaatar';
/** Calendar day of a visit in Ulaanbaatar. */
const day = sql`(${visits.at} at time zone ${sql.raw(`'${TZ}'`)})::date`;
const today = sql`(now() at time zone ${sql.raw(`'${TZ}'`)})::date`;
/** One person counts once per day: the visitor hash already changes daily. */
const people = sql<number>`count(distinct ${visits.visitor})::int`;

export const DAYS = 30;

export interface Row {
  label: string;
  value: number;
}

export interface VisitStats {
  today: { visitors: number; views: number };
  week: { visitors: number; views: number };
  month: { visitors: number; views: number };
  /** Orders placed in the last 30 days, to compare with visitors. */
  monthOrders: number;
  /** Visitors per day, oldest first, one entry for each of the last 30 days. */
  daily: { day: string; visitors: number; views: number }[];
  sources: Row[];
  pages: Row[];
  countries: Row[];
  devices: Row[];
}

const SOURCE_LABELS: Record<string, string> = {
  facebook: 'Facebook / Messenger',
  instagram: 'Instagram',
  telegram: 'Telegram',
  google: 'Google',
  youtube: 'YouTube',
  search: 'Бусад хайлт (Bing, Yandex…)',
  direct: 'Хаягийг шууд бичиж эсвэл хуулсан холбоосоор',
};
const DEVICE_LABELS: Record<string, string> = { mobile: 'Утас', tablet: 'Таблет', desktop: 'Компьютер' };

function countryName(code: string | null): string {
  if (!code) return 'Тодорхойгүй';
  try {
    return new Intl.DisplayNames(['mn'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export async function getVisitStats(): Promise<VisitStats | null> {
  const db = getDb();
  if (!db) return null;
  const recent = gt(visits.at, sql`now() - interval '${sql.raw(String(DAYS + 1))} days'`);
  const inMonth = and(recent, sql`${day} > ${today} - ${sql.raw(String(DAYS))}`);
  const arrivals = and(inMonth, ne(visits.source, 'internal'));
  const visitorDays = sql<number>`count(distinct (${day}::text || ${visits.visitor}))::int`;
  // Each person's first arrival of the day, so every person counts under one source only
  // and the sources list adds up to the visitor total.
  const firstArrival = db
    .selectDistinctOn([day, visits.visitor], { source: visits.source })
    .from(visits)
    .where(arrivals)
    .orderBy(day, visits.visitor, visits.at)
    .as('first_arrival');

  const [summary, daily, sources, pages, countries, devices, monthOrders] = await Promise.all([
    db
      .select({
        todayVisitors: sql<number>`count(distinct ${visits.visitor}) filter (where ${day} = ${today})::int`,
        todayViews: sql<number>`count(*) filter (where ${day} = ${today})::int`,
        weekVisitors: sql<number>`count(distinct (${day}::text || ${visits.visitor})) filter (where ${day} > ${today} - 7)::int`,
        weekViews: sql<number>`count(*) filter (where ${day} > ${today} - 7)::int`,
        monthVisitors: visitorDays,
        monthViews: sql<number>`count(*)::int`,
      })
      .from(visits)
      .where(inMonth),
    db
      .select({ day: sql<string>`${day}::text`, visitors: people, views: sql<number>`count(*)::int` })
      .from(visits)
      .where(inMonth)
      .groupBy(day),
    db
      .select({ key: firstArrival.source, value: sql<number>`count(*)::int` })
      .from(firstArrival)
      .groupBy(firstArrival.source)
      .orderBy(sql`2 desc`)
      .limit(8),
    db
      .select({ key: visits.path, value: sql<number>`count(*)::int` })
      .from(visits)
      .where(inMonth)
      .groupBy(visits.path)
      .orderBy(sql`2 desc`)
      .limit(8),
    db
      .select({ key: visits.country, value: visitorDays })
      .from(visits)
      .where(inMonth)
      .groupBy(visits.country)
      .orderBy(sql`2 desc`)
      .limit(8),
    db
      .select({ key: visits.device, value: visitorDays })
      .from(visits)
      .where(inMonth)
      .groupBy(visits.device)
      .orderBy(sql`2 desc`),
    db
      .select({ n: count() })
      .from(orders)
      .where(gt(orders.createdAt, sql`now() - interval '${sql.raw(String(DAYS))} days'`)),
  ]);

  // Show article titles instead of their web addresses.
  const slugs = pages.map((p) => p.key.match(/^\/niitlel\/([^/]+)$/)?.[1]).filter((s): s is string => !!s);
  const titles = new Map<string, string>();
  if (slugs.length) {
    const found = await db
      .select({ slug: articles.slug, title: articles.title })
      .from(articles)
      .where(inArray(articles.slug, slugs.map(decodeURIComponent)));
    for (const a of found) titles.set(a.slug, a.title);
  }
  const pageLabel = (path: string) => {
    if (path === '/') return 'Нүүр хуудас';
    if (path === '/niitlel') return 'Мэдээний жагсаалт';
    const slug = path.match(/^\/niitlel\/([^/]+)$/)?.[1];
    if (slug) return `Мэдээ: ${titles.get(decodeURIComponent(slug)) ?? decodeURIComponent(slug)}`;
    return path;
  };

  // One bar per day, including days with no visits.
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const days: VisitStats['daily'] = [];
  const now = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(
      new Date(now.getTime() - i * 86_400_000),
    );
    const d = byDay.get(key);
    days.push({ day: key, visitors: d?.visitors ?? 0, views: d?.views ?? 0 });
  }

  const s = summary[0];
  return {
    today: { visitors: s?.todayVisitors ?? 0, views: s?.todayViews ?? 0 },
    week: { visitors: s?.weekVisitors ?? 0, views: s?.weekViews ?? 0 },
    month: { visitors: s?.monthVisitors ?? 0, views: s?.monthViews ?? 0 },
    monthOrders: monthOrders[0]?.n ?? 0,
    daily: days,
    sources: sources.map((r) => ({ label: SOURCE_LABELS[r.key] ?? r.key, value: r.value })),
    pages: pages.map((r) => ({ label: pageLabel(r.key), value: r.value })),
    countries: countries.map((r) => ({ label: countryName(r.key), value: r.value })),
    devices: devices.map((r) => ({ label: DEVICE_LABELS[r.key] ?? r.key, value: r.value })),
  };
}
