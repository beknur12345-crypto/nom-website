'use server';

import { headers } from 'next/headers';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import { contactEmail, orderEmail } from '@/emails/templates';
import { isEmailConfigured, notifyOwner } from '@/lib/email';
import type { FormResult } from '@/lib/form-result';
import { calculateTotals } from '@/lib/pricing';
import { createRateLimiter } from '@/lib/rate-limit';
import {
  CONTACT_FIELDS,
  HONEYPOT_FIELD,
  ORDER_FIELDS,
  contactSchema,
  fieldErrors,
  formDataToObject,
  orderSchema,
} from '@/lib/schemas';
import { site } from '@/content/site';

const orderLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
const contactLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}

const isBot = (formData: FormData) => Boolean(formData.get(HONEYPOT_FIELD));

export async function submitOrder(formData: FormData): Promise<FormResult> {
  // Bots get a fake success so they don't retry.
  if (isBot(formData)) return { status: 'success', mode: 'test' };

  const parsed = orderSchema.safeParse(formDataToObject(formData, ORDER_FIELDS));
  if (!parsed.success) return { status: 'invalid', errors: fieldErrors(parsed.error) };

  if (!orderLimiter(await clientIp())) return { status: 'error', reason: 'rate-limited' };

  const order = parsed.data;
  const totals = calculateTotals(order.quantity);
  const db = getDb();

  if (!db) {
    console.info('[order] test mode, not saved:', { ...order, ...totals });
    return { status: 'success', mode: 'test' };
  }

  let reference: string;
  try {
    const [row] = await db
      .insert(orders)
      .values({
        name: order.name,
        phone: order.phone,
        city: order.city,
        district: order.district,
        address: order.address,
        quantity: totals.quantity,
        payMethod: order.pay,
        unitPrice: site.pricing.unitPrice,
        delivery: totals.delivery,
        total: totals.total,
      })
      .returning({ id: orders.id });
    if (!row) throw new Error('Insert returned no row');
    reference = `№${row.id}`;
  } catch (err) {
    console.error('[order] database insert failed:', err);
    return { status: 'error', reason: 'server' };
  }

  // The order is saved; a failed notification must not fail the customer's order.
  await notifyOwner(orderEmail(order, totals, reference));
  return { status: 'success', mode: 'live', reference };
}

export async function submitContact(formData: FormData): Promise<FormResult> {
  if (isBot(formData)) return { status: 'success', mode: 'test' };

  const parsed = contactSchema.safeParse(formDataToObject(formData, CONTACT_FIELDS));
  if (!parsed.success) return { status: 'invalid', errors: fieldErrors(parsed.error) };

  if (!contactLimiter(await clientIp())) return { status: 'error', reason: 'rate-limited' };

  if (!isEmailConfigured()) {
    console.info('[contact] test mode, not sent:', parsed.data);
    return { status: 'success', mode: 'test' };
  }

  const sent = await notifyOwner({ ...contactEmail(parsed.data), replyTo: parsed.data.email });
  return sent ? { status: 'success', mode: 'live' } : { status: 'error', reason: 'server' };
}
