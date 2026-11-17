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
  // Admin dashboard at /admin. Without a password the dashboard does not exist (404).
  ADMIN_PASSWORD: optional,
  // Signs admin session cookies. Falls back to a key derived from ADMIN_PASSWORD.
  ADMIN_SESSION_SECRET: optional,
  // Telegram bot that pushes each new order to the owner's phone.
  TELEGRAM_BOT_TOKEN: optional,
  // One or more chat ids, comma separated (e.g. the owner and an assistant).
  TELEGRAM_CHAT_ID: optional,
});

/** Server-only environment. Every value is optional so the site runs in test mode without secrets. */
export const env = schema.parse(process.env);
