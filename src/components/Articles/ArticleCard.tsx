import Link from 'next/link';
import type { Article } from '@/db/schema';
import { formatDay, safeUrl, summary } from '@/lib/article-text';
import styles from './Articles.module.css';

/** One article in a list. Text-only articles open their page; link-only ones open the original source. */
export function ArticleCard({ article, headingLevel = 3 }: { article: Article; headingLevel?: 2 | 3 }) {
  const external = !article.body.trim() ? safeUrl(article.sourceUrl) : null;
  const H = `h${headingLevel}` as const;
  const text = summary(article.excerpt, article.body);
  return (
    <article className={styles.card}>
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
      <span className={styles.more} aria-hidden="true">
        {external ? 'Эх сурвалжаас унших ↗' : 'Унших'}
      </span>
    </article>
  );
}
