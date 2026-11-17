import { boolean, check, date, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ORDER_STATUSES } from '@/lib/labels';
import { PAY_METHODS } from '@/lib/schemas';

export const payMethod = pgEnum('pay_method', PAY_METHODS);
export const orderStatus = pgEnum('order_status', ORDER_STATUSES);

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

/** Single-row table holding how many books are left. */
export const inventory = pgTable(
  'inventory',
  {
    id: integer('id').primaryKey().default(1),
    stock: integer('stock').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check('inventory_single_row', sql`${t.id} = 1`),
    check('inventory_stock_nonnegative', sql`${t.stock} >= 0`),
  ],
);

/** Articles ("Нийтлэл") written in the admin dashboard and shown on the site. */
export const articles = pgTable('articles', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  /** Plain text. Blank lines separate paragraphs; a line starting with "## " is a subheading. */
  body: text('body').notNull().default(''),
  /** Where it was first published (newspaper, site), optional. */
  sourceName: text('source_name'),
  sourceUrl: text('source_url'),
  publishedOn: date('published_on', { mode: 'string' }).notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
