// Applies pending database migrations (drizzle/) before each Vercel build, with
// that environment's own DATABASE_URL. Already-applied migrations are skipped.
// A failure fails the build, so the current live deployment keeps serving.
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.log('[migrate] No DATABASE_URL, skipping.');
  process.exit(0);
}
await migrate(drizzle(neon(url)), { migrationsFolder: './drizzle' });
console.log(`[migrate] Database is up to date (${process.env.VERCEL_ENV ?? 'local'}).`);
