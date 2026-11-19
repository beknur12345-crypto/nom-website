import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/db/schema';
import { formatDay, safeUrl, summary } from '@/lib/article-text';
import styles from './Articles.module.css';

/** One article in a list. Link-only articles (no text, photos or PDFs) open the original source; the rest open their page. */
export function ArticleCard({ article, headingLevel = 3 }: { article: Article; headingLevel?: 2 | 3 }) {
  const ownContent = article.body.trim() || article.images.length || article.files.length;
  const external = !ownContent ? safeUrl(article.sourceUrl) : null;
  const cover = article.images[0];
  const H = `h${headingLevel}` as const;
  const text = summary(article.excerpt, article.body);
  return (
    <article className={styles.card}>
      {cover && (
        <Image
          className={styles.cover}
          src={cover.url}
          alt=""
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 900px) 100vw, 400px"
        />
      )}
      <p className={styles.meta}>
        <time dateTime={article.publishedOn}>{formatDay(article.publishedOn)}</time>
        {article.sourceName && <span>{article.sourceName}</span>}
      </p>
      <H className={styles.title}>
        {external ? (
          <a href={external} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        ) : (
          <Link href={`/niitlel/${article.slug}`}>{article.title}</Link>
        )}
      </H>
      {text && <p className={styles.excerpt}>{text}</p>}
      {article.files.length > 0 && <p className={styles.attach}>PDF · {article.files.length} файл</p>}
      <span className={styles.more} aria-hidden="true">
        {external ? 'Эх сурвалжаас унших ↗' : 'Унших'}
      </span>
    </article>
  );
}
