'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import { checkPassword, createSession, destroySession, requireAdmin } from '@/lib/admin-auth';
import { isStatus } from '@/lib/admin-orders';
import { createRateLimiter } from '@/lib/rate-limit';
import { clientIp, record, recentCount } from '@/lib/shared-limit';
import { releaseStock, retakeStock, setStock } from '@/lib/stock';
import { sendTelegram } from '@/lib/telegram';

const loginLimiter = createRateLimiter({ limit: 8, windowMs: 15 * 60_000 });

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await clientIp();
  const tooMany = { error: 'Хэт олон буруу оролдлого. 15 минутын дараа дахин оролдоно уу.' };
  if (!loginLimiter(ip)) return tooMany;
  // Shared across all server instances: 5 wrong tries per IP in 15 min, 20 from everyone in an hour.
  const [mine, everyone] = await Promise.all([
    recentCount('login-fail', 15 * 60_000, ip),
    recentCount('login-fail', 60 * 60_000),
  ]);
  if (mine >= 5 || everyone >= 20) return tooMany;

  const password = formData.get('password');
  if (typeof password !== 'string' || !checkPassword(password)) {
    await record('login-fail', ip);
    return { error: 'Нууц үг буруу байна.' };
  }
  await createSession();
  redirect('/admin');
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect('/admin');
}

const orderId = (formData: FormData) => {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) throw new Error('Bad order id');
  return id;
};

export async function setStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const status = formData.get('status');
  if (!isStatus(status)) throw new Error('Bad status');
  const db = getDb();
  if (!db) return;
  const id = orderId(formData);
  const [before] = await db
    .select({ status: orders.status, quantity: orders.quantity })
    .from(orders)
    .where(eq(orders.id, id));
  if (!before || before.status === status) return;
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  // Cancelling puts the books back on the shelf; un-cancelling takes them again.
  if (status === 'cancelled') await releaseStock(before.quantity);
  else if (before.status === 'cancelled') await retakeStock(before.quantity);
  revalidatePath('/admin');
  revalidatePath('/');
}

export type StockState = { error?: string; saved?: boolean };

export async function updateStock(_prev: StockState, formData: FormData): Promise<StockState> {
  await requireAdmin();
  const n = Number(formData.get('stock'));
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000)
    return { error: '0 ба түүнээс их бүхэл тоо оруулна уу' };
  await setStock(n);
  revalidatePath('/admin');
  revalidatePath('/');
  return { saved: true };
}

export async function saveNote(formData: FormData): Promise<void> {
  await requireAdmin();
  const note =
    String(formData.get('note') ?? '')
      .trim()
      .slice(0, 2000) || null;
  await getDb()
    ?.update(orders)
    .set({ note })
    .where(eq(orders.id, orderId(formData)));
  revalidatePath('/admin');
}

export async function sendTestNotification(): Promise<{ ok: boolean }> {
  await requireAdmin();
  const ok = await sendTelegram('✅ <b>Туршилтын мэдэгдэл</b>\nШинэ захиалга ирэх бүрт энд мэдэгдэл ирнэ.');
  return { ok };
}
