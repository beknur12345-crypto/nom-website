import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from '@/components/Articles/ArticlePage.module.css';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { Share } from '@/components/Share/Share';
import { site } from '@/content/site';
import { formatDay, parseBody, safeUrl, summary } from '@/lib/article-text';
import { getPublishedArticle } from '@/lib/articles';
import { navLinks } from '@/lib/nav';

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<'/niitlel/[slug]'>): Promise<Metadata> {
  const a = await getPublishedArticle((await params).slug);
  if (!a) return {};
  const description = summary(a.excerpt, a.body);
  return {
    title: `${a.title} | ${site.title}`,
    description,
    alternates: { canonical: `/niitlel/${a.slug}` },
    openGraph: {
      type: 'article',
      title: a.title,
      description,
      publishedTime: a.publishedOn,
      authors: [site.author],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<'/niitlel/[slug]'>) {
  const a = await getPublishedArticle((await params).slug);
  if (!a) notFound();
  const blocks = parseBody(a.body);
  const source = safeUrl(a.sourceUrl);

  return (
    <>
      <Header links={navLinks({ hasArticles: true, home: false })} home={false} orderCta={false} />
      <main id="main" className={styles.page}>
        <article className={styles.article}>
          <Link className={styles.back} href="/niitlel">
            ← Бүх нийтлэл
          </Link>
          <p className={styles.meta}>
            <time dateTime={a.publishedOn}>{formatDay(a.publishedOn)}</time>
            <span>{site.author}</span>
          </p>
          <h1>{a.title}</h1>
          {a.excerpt && <p className={styles.lede}>{a.excerpt}</p>}

          <div className={styles.body}>
            {blocks.map((b, i) => (b.type === 'h2' ? <h2 key={i}>{b.text}</h2> : <p key={i}>{b.text}</p>))}
          </div>

          {(source || a.sourceName) && (
            <p className={styles.source}>
              Эх сурвалж:{' '}
              {source ? (
                <a href={source} target="_blank" rel="noopener noreferrer">
                  {a.sourceName || source} ↗
                </a>
              ) : (
                a.sourceName
              )}
            </p>
          )}
          {blocks.length === 0 && source && (
            <a className="btn" href={source} target="_blank" rel="noopener noreferrer">
              Эх сурвалжаас унших ↗
            </a>
          )}

          <Share label="Нийтлэлийг share хийх" />
        </article>
      </main>
      <Footer share={false} />
    </>
  );
}
