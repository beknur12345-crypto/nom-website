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
        pay: 'qr',
      },
      calculateTotals(1, { unitPrice: 45000, delivery: 0 }),
      '№1001',
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('₮45,000');
    expect(subject).toContain('№1001');
  });
});
