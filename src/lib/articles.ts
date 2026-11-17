import 'server-only';
import { and, desc, eq, ne } from 'drizzle-orm';
import { getDb } from '@/db';
import { articles, type Article } from '@/db/schema';
import { slugify } from './article-text';

const newestFirst = [desc(articles.publishedOn), desc(articles.id)];

/** Published articles, newest first. Never throws (the public site must render). */
export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = db
      .select()
      .from(articles)
      .where(eq(articles.isPublished, true))
      .orderBy(...newestFirst);
    return await (limit ? q.limit(limit) : q);
  } catch (err) {
    console.error('[articles] read failed:', err);
    return [];
  }
}

export async function getPublishedArticle(slug: string): Promise<Article | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const [row] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.isPublished, true)));
    return row ?? null;
  } catch (err) {
    console.error('[articles] read failed:', err);
    return null;
  }
}

/** Admin: every article including drafts. */
export async function getAllArticles(): Promise<Article[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .orderBy(...newestFirst);
}

export async function getArticle(id: number): Promise<Article | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.select().from(articles).where(eq(articles.id, id));
  return row ?? null;
}

/** A slug from the title that no other article uses ("-2", "-3", … when taken). */
export async function uniqueSlug(title: string, exceptId?: number): Promise<string> {
  const db = getDb();
  const base = slugify(title);
  if (!db) return base;
  for (let n = 1; ; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const [taken] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(
        exceptId
          ? and(eq(articles.slug, candidate), ne(articles.id, exceptId))
          : eq(articles.slug, candidate),
      );
    if (!taken) return candidate;
  }
}
