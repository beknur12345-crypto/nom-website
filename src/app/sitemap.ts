import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { getPublishedArticles } from '@/lib/articles';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();
  return [
    { url: site.url, changeFrequency: 'monthly', priority: 1 },
    ...(articles.length
      ? [
          { url: `${site.url}/niitlel`, changeFrequency: 'weekly' as const, priority: 0.7 },
          ...articles.map((a) => ({
            url: `${site.url}/niitlel/${a.slug}`,
            lastModified: a.updatedAt,
            priority: 0.6,
          })),
        ]
      : []),
  ];
}
