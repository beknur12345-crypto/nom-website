import 'server-only';
import { z } from 'zod';

const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));

const schema = z.object({
  DATABASE_URL: optional,
  RESEND_API_KEY: optional,
  EMAIL_FROM: optional.transform((v) => v ?? 'Улс төрийн тулаан <orders@ulsturiintulaan.com>'),
  ORDER_NOTIFY_EMAIL: optional,
});

/** Server-only environment. Every value is optional so the site runs in test mode without secrets. */
export const env = schema.parse(process.env);
