import { z } from 'zod';
import type { ArticleFile, ArticleImage } from '@/db/schema';

/** Upload rules shared by the editor (browser) and the upload route (server). */
export const MEDIA = {
  image: { types: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 10 * 1024 * 1024, max: 12 },
  pdf: { types: ['application/pdf'], maxBytes: 25 * 1024 * 1024, max: 5 },
} as const;

export type MediaKind = keyof typeof MEDIA;

/** Every upload lives under this folder in the store. */
export const MEDIA_PREFIX = 'medee/';

/** Only files in our own public Blob store are accepted back from the form. */
const blobUrl = z
  .string()
  .url()
  .max(600)
  .refine((u) => {
    try {
      const url = new URL(u);
      return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
    } catch {
      return false;
    }
  });
const pathname = z.string().startsWith(MEDIA_PREFIX).max(300);

const imageSchema = z.object({
  url: blobUrl,
  pathname,
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
});
const fileSchema = z.object({
  url: blobUrl,
  pathname,
  name: z.string().trim().min(1).max(160),
  size: z.number().int().nonnegative().max(MEDIA.pdf.maxBytes),
});

/** Parses the editor's hidden JSON fields. Returns null when they were tampered with. */
export function parseMedia(
  rawImages: string,
  rawFiles: string,
): { images: ArticleImage[]; files: ArticleFile[] } | null {
  try {
    const images = z
      .array(imageSchema)
      .max(MEDIA.image.max)
      .parse(JSON.parse(rawImages || '[]'));
    const files = z
      .array(fileSchema)
      .max(MEDIA.pdf.max)
      .parse(JSON.parse(rawFiles || '[]'));
    return { images, files };
  } catch {
    return null;
  }
}

/** "2.4 MB" */
export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
