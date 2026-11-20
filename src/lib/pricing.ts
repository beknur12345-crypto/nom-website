import { site } from '@/content/site';

export const MIN_QTY = 1;
export const MAX_QTY = 10;

export interface Pricing {
  /** Price of one book in tugrik. 0 means "not set yet". */
  unitPrice: number;
  /** Flat delivery fee per order in tugrik. */
  delivery: number;
  /** Percent of the total paid up front; the rest is paid on delivery. */
  depositPercent: number;
}

export interface Payment {
  /** Paid by bank transfer when ordering. */
  deposit: number;
  /** Paid on delivery. */
  balance: number;
}

export interface Totals extends Payment {
  quantity: number;
  books: number;
  delivery: number;
  total: number;
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.trunc(quantity)));
}

/** Splits a total into the up-front deposit (rounded to whole tugrik) and the balance due on delivery. */
export function splitPayment(total: number, depositPercent: number = site.pricing.depositPercent): Payment {
  const deposit = Math.round((total * depositPercent) / 100);
  return { deposit, balance: total - deposit };
}

/**
 * Single source of truth for order totals. The server always recalculates
 * with this function and never trusts amounts sent by the browser.
 */
export function calculateTotals(quantity: number, pricing: Pricing = site.pricing): Totals {
  const qty = clampQuantity(quantity);
  const books = pricing.unitPrice * qty;
  const total = books + pricing.delivery;
  return {
    quantity: qty,
    books,
    delivery: pricing.delivery,
    total,
    ...splitPayment(total, pricing.depositPercent),
  };
}

export const isPriceSet = (pricing: Pricing = site.pricing): boolean => pricing.unitPrice > 0;
