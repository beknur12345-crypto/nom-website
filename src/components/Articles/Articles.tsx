import Link from 'next/link';
import type { Article } from '@/db/schema';
import { ArticleCard } from './ArticleCard';
import styles from './Articles.module.css';

/** Home page section with the latest articles. Renders nothing until one is published. */
export function Articles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section className={styles.section} id="articles" aria-labelledby="articles-title">
      <div className={styles.head}>
        <h2 id="articles-title">Мэдээ мэдээлэл</h2>
        <Link className={styles.all} href="/niitlel">
          Бүх мэдээ
        </Link>
      </div>
      <div className={styles.grid}>
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
