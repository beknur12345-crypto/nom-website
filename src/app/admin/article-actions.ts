'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import { articles } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { safeUrl } from '@/lib/article-text';
import { getArticle, uniqueSlug } from '@/lib/articles';

export type ArticleState = {
  errors?: Partial<Record<'title' | 'body' | 'sourceUrl' | 'publishedOn' | 'form', string>>;
};

const str = (fd: FormData, k: string, max: number) =>
  String(fd.get(k) ?? '')
    .trim()
    .slice(0, max);

/** Pages that show articles: refresh them after any change. */
function refreshPublic(slug?: string) {
  revalidatePath('/');
  revalidatePath('/niitlel');
  if (slug) revalidatePath(`/niitlel/${slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/niitlel');
}

export async function saveArticle(_prev: ArticleState, fd: FormData): Promise<ArticleState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { errors: { form: 'Өгөгдлийн сан холбогдоогүй байна.' } };

  const id = Number(fd.get('id')) || undefined;
  const title = str(fd, 'title', 200);
  const excerpt = str(fd, 'excerpt', 400);
  const body = str(fd, 'body', 100_000);
  const sourceName = str(fd, 'sourceName', 120) || null;
  const rawUrl = str(fd, 'sourceUrl', 500);
  const sourceUrl = safeUrl(rawUrl);
  const publishedOn = str(fd, 'publishedOn', 10);
  const publish = fd.get('intent') === 'publish';

  const errors: ArticleState['errors'] = {};
  if (!title) errors.title = 'Гарчгаа бичнэ үү';
  if (rawUrl && !sourceUrl) errors.sourceUrl = 'https:// -ээр эхэлсэн холбоос оруулна уу';
  if (!body && !sourceUrl)
    errors.body = 'Мэдээний текст эсвэл эх сурвалжийн холбоосын аль нэгийг оруулна уу';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) errors.publishedOn = 'Огноогоо сонгоно уу';
  if (Object.keys(errors).length) return { errors };

  const values = {
    title,
    excerpt,
    body,
    sourceName,
    sourceUrl,
    publishedOn,
    isPublished: publish,
    updatedAt: new Date(),
  };
  let slug: string;
  if (id) {
    const existing = await getArticle(id);
    if (!existing) return { errors: { form: 'Мэдээ олдсонгүй.' } };
    // Keep the address stable once created, so shared links keep working.
    slug = existing.slug;
    await db.update(articles).set(values).where(eq(articles.id, id));
  } else {
    slug = await uniqueSlug(title);
    await db.insert(articles).values({ ...values, slug });
  }
  refreshPublic(slug);
  redirect(`/admin/niitlel?saved=${publish ? 'published' : 'draft'}`);
}

export async function setPublished(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(fd.get('id'));
  const publish = fd.get('publish') === '1';
  const a = await getArticle(id);
  if (!a) return;
  await getDb()
    ?.update(articles)
    .set({ isPublished: publish, updatedAt: new Date() })
    .where(eq(articles.id, id));
  refreshPublic(a.slug);
}

export async function deleteArticle(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(fd.get('id'));
  const a = await getArticle(id);
  if (!a) return;
  await getDb()?.delete(articles).where(eq(articles.id, id));
  refreshPublic(a.slug);
}
