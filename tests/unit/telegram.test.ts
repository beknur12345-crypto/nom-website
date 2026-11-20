import { describe, expect, it } from 'vitest';
import { orderTelegram } from '@/emails/templates';
import type { OrderInput } from '@/lib/schemas';

const order: OrderInput = {
  name: 'Бат <b>',
  phone: '99112233',
  city: 'Улаанбаатар',
  district: 'СБД',
  address: '1-р хороо & 5-р байр',
  quantity: 2,
  pay: 'bank',
};

describe('orderTelegram', () => {
  it('lists the order and escapes customer input', () => {
    const msg = orderTelegram(
      order,
      { quantity: 2, books: 0, delivery: 0, total: 0, deposit: 0, balance: 0 },
      '№1001',
    );
    expect(msg).toContain('Шинэ захиалга №1001');
    expect(msg).toContain('Бат &lt;b&gt;');
    expect(msg).toContain('1-р хороо &amp; 5-р байр');
    expect(msg).toContain('2 ширхэг · Дансаар');
    expect(msg).not.toContain('₮'); // no price set yet
  });

  it('shows the total and the deposit split once a price is set', () => {
    const msg = orderTelegram(
      order,
      { quantity: 2, books: 90000, delivery: 5000, total: 95000, deposit: 28500, balance: 66500 },
      '№7',
    );
    expect(msg).toContain('₮95,000');
    expect(msg).toContain('Урьдчилгаа 30%: <b>₮28,500</b>');
    expect(msg).toContain('Хүргэлтээр: ₮66,500');
  });
});
