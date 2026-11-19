'use server';

import { del } from '@vercel/blob';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import { articles } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { safeUrl } from '@/lib/article-text';
import { getArticle, uniqueSlug } from '@/lib/articles';
import { parseMedia } from '@/lib/media';

export type ArticleState = {
  errors?: Partial<Record<'title' | 'body' | 'sourceUrl' | 'publishedOn' | 'media' | 'form', string>>;
};

const str = (fd: FormData, k: string, max: number) =>
  String(fd.get(k) ?? '')
    .trim()
    .slice(0, max);

/** Deletes files from Blob storage. A failure only leaves an unused file behind, so it never blocks the admin. */
async function deleteBlobs(urls: string[]): Promise<void> {
  if (!urls.length || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(urls);
  } catch (err) {
    console.error('[articles] blob delete failed:', err);
  }
}

/** Pages that show articles: refresh them after any change. */
function refreshPublic(slug?: string) {
  revalidatePath('/');
  revalidatePath('/niitlel');
  if (slug) revalidatePath(`/niitlel/${slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/medee');
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
  const media = parseMedia(String(fd.get('images') ?? ''), String(fd.get('files') ?? ''));

  const errors: ArticleState['errors'] = {};
  if (!title) errors.title = 'Гарчгаа бичнэ үү';
  if (rawUrl && !sourceUrl) errors.sourceUrl = 'https:// -ээр эхэлсэн холбоос оруулна уу';
  if (!media) errors.media = 'Зураг, PDF файлын мэдээлэл буруу байна. Хуудсаа дахин ачаалаад оролдоно уу.';
  const hasMedia = Boolean(media && (media.images.length || media.files.length));
  if (!body && !sourceUrl && !hasMedia)
    errors.body = 'Мэдээний текст, эх сурвалжийн холбоос, зураг эсвэл PDF-ийн аль нэгийг оруулна уу';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) errors.publishedOn = 'Огноогоо сонгоно уу';
  if (Object.keys(errors).length || !media) return { errors };

  const values = {
    title,
    excerpt,
    body,
    sourceName,
    sourceUrl,
    publishedOn,
    images: media.images,
    files: media.files,
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
    // Files the admin removed in the editor are no longer needed.
    const kept = new Set([...media.images, ...media.files].map((m) => m.url));
    await deleteBlobs([...existing.images, ...existing.files].map((m) => m.url).filter((u) => !kept.has(u)));
  } else {
    slug = await uniqueSlug(title);
    await db.insert(articles).values({ ...values, slug });
  }
  refreshPublic(slug);
  redirect(`/admin/medee?saved=${publish ? 'published' : 'draft'}`);
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
  await deleteBlobs([...a.images, ...a.files].map((m) => m.url));
  refreshPublic(a.slug);
}
