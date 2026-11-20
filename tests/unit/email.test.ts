import { describe, expect, it } from 'vitest';
import { escapeHtml, orderEmail } from '@/emails/templates';
import { calculateTotals } from '@/lib/pricing';

describe('email templates', () => {
  it('escapes HTML in user input', () => {
    expect(escapeHtml('<script>"&\'')).toBe('&lt;script&gt;&quot;&amp;&#39;');
  });

  it('never puts raw customer input into the order email HTML', () => {
    const { html, subject } = orderEmail(
      {
        name: '<img src=x onerror=alert(1)>',
        phone: '99112233',
        city: 'Улаанбаатар',
        district: 'СБД',
        address: 'Хаяг',
        quantity: 1,
        pay: 'bank',
      },
      calculateTotals(1, { unitPrice: 45000, delivery: 0, depositPercent: 30 }),
      '№1001',
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('₮45,000');
    expect(html).toContain('₮13,500'); // 30% deposit
    expect(html).toContain('₮31,500'); // due on delivery
    expect(subject).toContain('№1001');
  });
});
