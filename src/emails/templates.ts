import { formatMNT } from '@/lib/money';
import type { ContactInput, OrderInput, PayMethod } from '@/lib/schemas';
import type { Totals } from '@/lib/pricing';

const PAY_LABELS: Record<PayMethod, string> = { qr: 'QR код', bank: 'Дансаар', card: 'Картаар' };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function table(rows: [string, string][]): string {
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b6457;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v)}</td></tr>`,
    )
    .join('');
  return `<table style="border-collapse:collapse;font:15px/1.45 Arial,sans-serif;color:#12161A">${body}</table>`;
}

export function orderEmail(order: OrderInput, totals: Totals, reference: string) {
  const subject = `Шинэ захиалга ${reference}: ${order.name}, ${totals.quantity} ширхэг`;
  const rows: [string, string][] = [
    ['Захиалга', reference],
    ['Нэр', order.name],
    ['Утас', order.phone],
    ['Хаяг', `${order.city}, ${order.district}, ${order.address}`],
    ['Тоо ширхэг', String(totals.quantity)],
    ['Төлбөр', PAY_LABELS[order.pay]],
    ['Номын үнэ', formatMNT(totals.books)],
    ['Хүргэлт', formatMNT(totals.delivery)],
    ['Нийт', formatMNT(totals.total)],
  ];
  const html = `<h2 style="font:700 20px Arial,sans-serif">Шинэ захиалга ирлээ</h2>${table(rows)}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  return { subject, html, text };
}

export function contactEmail(msg: ContactInput) {
  const subject = `Санал, захидал: ${msg.name}`;
  const html = `${table([
    ['Нэр', msg.name],
    ['И-мэйл', msg.email],
  ])}<p style="font:15px/1.6 Arial,sans-serif;white-space:pre-wrap;margin-top:16px">${escapeHtml(msg.message)}</p>`;
  const text = `Нэр: ${msg.name}\nИ-мэйл: ${msg.email}\n\n${msg.message}`;
  return { subject, html, text };
}
