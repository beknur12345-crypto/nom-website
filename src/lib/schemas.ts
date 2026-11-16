import { z } from 'zod';
import { MAX_QTY, MIN_QTY } from './pricing';
import { PROVINCES } from './provinces';

export const PAY_METHODS = ['qr', 'bank', 'card'] as const;
export type PayMethod = (typeof PAY_METHODS)[number];

const text = (message: string, max = 200) =>
  z.string({ error: message }).trim().min(1, message).max(max, `${max} тэмдэгтээс хэтрэхгүй байна уу`);

export const orderSchema = z.object({
  name: text('Нэрээ бичнэ үү', 120),
  phone: z
    .string({ error: '8 оронтой дугаар оруулна уу' })
    .transform((v) => v.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^\d{8}$/, '8 оронтой дугаар оруулна уу')),
  city: z.enum(PROVINCES, { error: 'Хот, аймгаа сонгоно уу' }),
  district: text('Дүүрэг, сумаа бичнэ үү', 120),
  address: text('Хаягаа бичнэ үү', 300),
  quantity: z.coerce.number().int().min(MIN_QTY).max(MAX_QTY),
  pay: z.enum(PAY_METHODS, { error: 'Төлбөрийн хэлбэрээ сонгоно уу' }),
});
export type OrderInput = z.infer<typeof orderSchema>;

export const contactSchema = z.object({
  name: text('Нэрээ бичнэ үү', 120),
  email: z.email({ error: 'И-мэйл хаягаа зөв бичнэ үү' }).trim().max(200),
  message: text('Зурвасаа бичнэ үү', 5000),
});
export type ContactInput = z.infer<typeof contactSchema>;

export type FieldErrors = Partial<Record<string, string>>;

/** Returns the first error message for each field, or null when valid. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    out[key] ??= issue.message;
  }
  return out;
}

/** Reads only the known string fields out of FormData. */
export function formDataToObject(formData: FormData, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') out[key] = value;
  }
  return out;
}

export const ORDER_FIELDS = Object.keys(orderSchema.shape);
export const CONTACT_FIELDS = Object.keys(contactSchema.shape);

/** Name of the hidden field bots tend to fill in. */
export const HONEYPOT_FIELD = 'website';
