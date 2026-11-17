import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { inventory } from '@/db/schema';

/** Books left, or null when stock is not tracked (no database / table not seeded). */
export async function getStock(): Promise<number | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const [row] = await db.select({ stock: inventory.stock }).from(inventory).where(eq(inventory.id, 1));
    return row?.stock ?? null;
  } catch (err) {
    console.error('[stock] read failed:', err);
    return null;
  }
}

export type Reservation = { ok: true; tracked: boolean } | { ok: false; left: number };

/**
 * Atomically takes `qty` books off the stock. A single conditional UPDATE, so
 * two buyers can never both take the last copy.
 */
export async function reserveStock(qty: number): Promise<Reservation> {
  const db = getDb();
  if (!db) return { ok: true, tracked: false };
  const [row] = await db
    .update(inventory)
    .set({ stock: sql`${inventory.stock} - ${qty}`, updatedAt: new Date() })
    .where(sql`${inventory.id} = 1 and ${inventory.stock} >= ${qty}`)
    .returning({ stock: inventory.stock });
  if (row) return { ok: true, tracked: true };
  const left = await getStock();
  // No inventory row means stock isn't tracked: never block a sale because of that.
  return left === null ? { ok: true, tracked: false } : { ok: false, left };
}

/** Puts books back (cancelled order, failed insert). */
export async function releaseStock(qty: number): Promise<void> {
  await getDb()
    ?.update(inventory)
    .set({ stock: sql`${inventory.stock} + ${qty}`, updatedAt: new Date() })
    .where(eq(inventory.id, 1));
}

/** Takes books again when a cancelled order is restored; never goes below zero. */
export async function retakeStock(qty: number): Promise<void> {
  await getDb()
    ?.update(inventory)
    .set({ stock: sql`greatest(${inventory.stock} - ${qty}, 0)`, updatedAt: new Date() })
    .where(eq(inventory.id, 1));
}

export async function setStock(stock: number): Promise<void> {
  await getDb()
    ?.insert(inventory)
    .values({ id: 1, stock })
    .onConflictDoUpdate({ target: inventory.id, set: { stock, updatedAt: new Date() } });
}
