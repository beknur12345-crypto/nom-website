import { site } from '@/content/site';

export const MIN_QTY = 1;
export const MAX_QTY = 99;

export interface Pricing {
  /** Price of one book in tugrik. 0 means "not set yet". */
  unitPrice: number;
  /** Flat delivery fee per order in tugrik. */
  delivery: number;
}

export interface Totals {
  quantity: number;
  books: number;
  delivery: number;
  total: number;
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.trunc(quantity)));
}

/**
 * Single source of truth for order totals. The server always recalculates
 * with this function and never trusts amounts sent by the browser.
 */
export function calculateTotals(quantity: number, pricing: Pricing = site.pricing): Totals {
  const qty = clampQuantity(quantity);
  const books = pricing.unitPrice * qty;
  return { quantity: qty, books, delivery: pricing.delivery, total: books + pricing.delivery };
}

export const isPriceSet = (pricing: Pricing = site.pricing): boolean => pricing.unitPrice > 0;
