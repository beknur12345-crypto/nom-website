import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { PAY_METHODS } from '@/lib/schemas';

export const payMethod = pgEnum('pay_method', PAY_METHODS);
export const orderStatus = pgEnum('order_status', ['new', 'paid', 'shipped', 'delivered', 'cancelled']);

export const orders = pgTable('orders', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1001 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  address: text('address').notNull(),
  quantity: integer('quantity').notNull(),
  payMethod: payMethod('pay_method').notNull(),
  unitPrice: integer('unit_price').notNull(),
  delivery: integer('delivery').notNull(),
  total: integer('total').notNull(),
  status: orderStatus('status').default('new').notNull(),
  note: text('note'),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
