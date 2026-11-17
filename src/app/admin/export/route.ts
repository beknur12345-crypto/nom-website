import { isSignedIn } from '@/lib/admin-auth';
import { getAllOrders } from '@/lib/admin-orders';
import { PAY_LABELS, STATUS_LABELS } from '@/lib/labels';

const cell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  // Quote everything; neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await isSignedIn())) return new Response('Unauthorized', { status: 401 });
  const rows = await getAllOrders();
  const head = [
    '№',
    'Огноо',
    'Төлөв',
    'Нэр',
    'Утас',
    'Хот/аймаг',
    'Дүүрэг/сум',
    'Хаяг',
    'Тоо',
    'Төлбөр',
    'Нийт ₮',
    'Тэмдэглэл',
  ];
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ulaanbaatar',
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const lines = rows.map((o) =>
    [
      o.id,
      fmt.format(o.createdAt),
      STATUS_LABELS[o.status],
      o.name,
      o.phone,
      o.city,
      o.district,
      o.address,
      o.quantity,
      PAY_LABELS[o.payMethod],
      o.total,
      o.note,
    ]
      .map(cell)
      .join(','),
  );
  // BOM so Excel opens the Cyrillic text correctly.
  const csv = '﻿' + [head.map(cell).join(','), ...lines].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="zahialga-${date}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
