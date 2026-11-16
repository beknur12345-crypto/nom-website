# Улс төрийн тулаан — book website

Website for the book **"Улс төрийн тулаан"** by Рэнцэнгийн Батсайхан: https://ulsturiintulaan.com

Next.js (App Router) · TypeScript (strict) · CSS Modules · Neon Postgres + Drizzle · Resend · zod · Vitest · Playwright. Hosted on Vercel.

## Editing content

All text, prices, quotes, cases, reviews and bank details are in **`src/content/site.ts`**.

- Price: set `pricing.unitPrice` (e.g. `45000`). While it is `0`, the site shows `₮00,000` placeholders.
- Quotes: wrap a word in `[brackets]` to black it out until readers tap it.
- Announcement bar: set `announcement` to a message, or `null` to hide it.
- QR code: replace `public/qr-sample.svg` and set `payment.qr.isSample` to `false`.

## Local development

```bash
npm install
cp .env.example .env.local   # optional: without secrets the forms run in test mode
npm run dev                  # http://localhost:3000
```

| Command              | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `npm run typecheck`  | TypeScript check                                                |
| `npm run lint`       | ESLint                                                          |
| `npm test`           | Unit tests (pricing, validation, email escaping, rate limit)    |
| `npm run test:e2e`   | Browser tests of the order and contact forms (desktop + mobile) |
| `npm run build`      | Production build                                                |
| `npm run db:migrate` | Apply database migrations in `drizzle/` to `DATABASE_URL`       |
| `npm run db:studio`  | Browse orders in Drizzle Studio                                 |

CI (`.github/workflows/ci.yml`) runs all of these on every push.

## How orders work

1. The browser validates the form with the same zod schema the server uses (`src/lib/schemas.ts`).
2. The server action `submitOrder` (`src/app/actions.ts`) validates again, recalculates the total (it never trusts the browser), and saves the order to the `orders` table.
3. The owner gets an email via Resend. If the email fails, the order is still saved.
4. Spam protection: a hidden honeypot field plus a per-IP rate limit.

Without `DATABASE_URL`, orders are only logged and the customer sees "Туршилтын горим" (test mode).

## Environment variables

See `.env.example`. On Vercel: `DATABASE_URL` (added automatically by the Neon integration), `RESEND_API_KEY`, `EMAIL_FROM`, `ORDER_NOTIFY_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

## Deploying (one-time setup)

1. Import this repo in Vercel (framework: Next.js).
2. Add the **Neon** integration from the Vercel Marketplace, then run `npm run db:migrate` once against that database.
3. Create a Resend account, verify the `ulsturiintulaan.com` domain, and add the API key and notification email in Vercel.
4. Add the domain `ulsturiintulaan.com` in Vercel → Domains and set the DNS records it shows at your registrar.
