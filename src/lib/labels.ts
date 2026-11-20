import type { PayMethod } from './schemas';

export const PAY_LABELS: Record<PayMethod, string> = { qr: 'QR код', bank: 'Дансаар', card: 'Картаар' };

export const ORDER_STATUSES = ['new', 'paid', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Шинэ',
  /** The up-front deposit is in; the rest is collected on delivery. */
  paid: 'Урьдчилгаа төлсөн',
  shipped: 'Илгээсэн',
  delivered: 'Хүргэсэн',
  cancelled: 'Цуцалсан',
};
