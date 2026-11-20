import { describe, expect, it } from 'vitest';
import { MAX_QTY, calculateTotals, clampQuantity, isPriceSet, splitPayment } from '@/lib/pricing';
import { formatMNT } from '@/lib/money';

const pricing = { unitPrice: 45000, delivery: 5000, depositPercent: 30 };

describe('calculateTotals', () => {
  it('multiplies books, adds one delivery fee and splits off the 30% deposit', () => {
    expect(calculateTotals(3, pricing)).toEqual({
      quantity: 3,
      books: 135000,
      delivery: 5000,
      total: 140000,
      deposit: 42000,
      balance: 98000,
    });
  });

  it('clamps quantities the browser should never send', () => {
    expect(calculateTotals(0, pricing).quantity).toBe(1);
    expect(calculateTotals(-5, pricing).quantity).toBe(1);
    expect(calculateTotals(1000, pricing).quantity).toBe(MAX_QTY);
    expect(calculateTotals(2.9, pricing).quantity).toBe(2);
  });
});

describe('splitPayment', () => {
  it('rounds the deposit to whole tugrik and leaves the exact rest as balance', () => {
    expect(splitPayment(45001, 30)).toEqual({ deposit: 13500, balance: 31501 });
    expect(splitPayment(0, 30)).toEqual({ deposit: 0, balance: 0 });
  });
});

describe('clampQuantity', () => {
  it('falls back to 1 for non-numbers', () => {
    expect(clampQuantity(Number.NaN)).toBe(1);
    expect(clampQuantity(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe('isPriceSet', () => {
  it('treats 0 as not configured', () => {
    expect(isPriceSet({ unitPrice: 0, delivery: 0, depositPercent: 30 })).toBe(false);
    expect(isPriceSet(pricing)).toBe(true);
  });
});

describe('formatMNT', () => {
  it('formats with a tugrik sign and thousands separators', () => {
    expect(formatMNT(45000)).toBe('₮45,000');
    expect(formatMNT(0)).toBe('₮0');
  });
});
