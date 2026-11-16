import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/lib/env';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;
let db: Db | undefined;

/** Returns the database client, or null when DATABASE_URL is not set (test mode). */
export function getDb(): Db | null {
  if (!env.DATABASE_URL) return null;
  db ??= drizzle(neon(env.DATABASE_URL), { schema });
  return db;
}
