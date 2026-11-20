import 'server-only';
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { getDb } from '@/db';
import { orders, type Order } from '@/db/schema';
import { ORDER_STATUSES, type OrderStatus } from './labels';
import { splitPayment } from './pricing';

export const isStatus = (v: unknown): v is OrderStatus => ORDER_STATUSES.includes(v as OrderStatus);

export interface Stats {
  counts: Record<OrderStatus | 'all', number>;
  /** Money still to collect: new orders in full, plus the on-delivery balance of paid and shipped ones. */
  toCollect: number;
  /** Money received: deposits of paid and shipped orders, plus delivered orders in full. */
  revenue: number;
  booksSold: number;
}

export async function getStats(): Promise<Stats | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select({
      status: orders.status,
      n: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
      qty: sql<number>`coalesce(sum(${orders.quantity}), 0)::int`,
    })
    .from(orders)
    .groupBy(orders.status);

  const counts = { all: 0, new: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0 };
  let toCollect = 0;
  let revenue = 0;
  let booksSold = 0;
  for (const r of rows) {
    counts[r.status] = r.n;
    counts.all += r.n;
    if (r.status === 'new') toCollect += r.total;
    if (r.status === 'paid' || r.status === 'shipped') {
      const { deposit, balance } = splitPayment(r.total);
      revenue += deposit;
      toCollect += balance;
      booksSold += r.qty;
    }
    if (r.status === 'delivered') {
      revenue += r.total;
      booksSold += r.qty;
    }
  }
  return { counts, toCollect, revenue, booksSold };
}

export async function getOrders({ status, q }: { status?: OrderStatus; q?: string }): Promise<Order[]> {
  const db = getDb();
  if (!db) return [];
  const where: SQL[] = [];
  if (status) where.push(eq(orders.status, status));
  const term = q?.trim().replace(/^№/, '');
  if (term) {
    const digits = term.replace(/[\s-]/g, '');
    const match = [ilike(orders.name, `%${term}%`), ilike(orders.address, `%${term}%`)];
    if (/^\d+$/.test(digits)) {
      match.push(ilike(orders.phone, `%${digits}%`));
      if (digits.length <= 9) match.push(eq(orders.id, Number(digits)));
    }
    where.push(or(...match)!);
  }
  return db
    .select()
    .from(orders)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(300);
}

export async function getAllOrders(): Promise<Order[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}
