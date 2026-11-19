import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from '@/components/Articles/ArticlePage.module.css';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { Share } from '@/components/Share/Share';
import { site } from '@/content/site';
import { formatDay, parseBody, safeUrl, summary } from '@/lib/article-text';
import { getPublishedArticle } from '@/lib/articles';
import { formatSize } from '@/lib/media';
import { navLinks } from '@/lib/nav';

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<'/niitlel/[slug]'>): Promise<Metadata> {
  const a = await getPublishedArticle((await params).slug);
  if (!a) return {};
  const description = summary(a.excerpt, a.body);
  const cover = a.images[0];
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
      ...(cover && { images: [{ url: cover.url, width: cover.width, height: cover.height, alt: a.title }] }),
    },
  };
}

export default async function ArticlePage({ params }: PageProps<'/niitlel/[slug]'>) {
  const a = await getPublishedArticle((await params).slug);
  if (!a) notFound();
  const blocks = parseBody(a.body);
  const source = safeUrl(a.sourceUrl);
  const [cover, ...gallery] = a.images;

  return (
    <>
      <Header links={navLinks({ hasArticles: true, home: false })} home={false} orderCta={false} />
      <main id="main" className={styles.page}>
        <article className={styles.article}>
          <Link className={styles.back} href="/niitlel">
            ← Бүх мэдээ
          </Link>
          <p className={styles.meta}>
            <time dateTime={a.publishedOn}>{formatDay(a.publishedOn)}</time>
            <span>{site.author}</span>
          </p>
          <h1>{a.title}</h1>
          {a.excerpt && <p className={styles.lede}>{a.excerpt}</p>}
          {cover && (
            <Image
              className={styles.cover}
              src={cover.url}
              alt={a.title}
              width={cover.width}
              height={cover.height}
              sizes="(max-width: 760px) 100vw, 720px"
              priority
            />
          )}

          <div className={styles.body}>
            {blocks.map((b, i) => (b.type === 'h2' ? <h2 key={i}>{b.text}</h2> : <p key={i}>{b.text}</p>))}
          </div>

          {gallery.length > 0 && (
            <div className={styles.gallery}>
              {gallery.map((img) => (
                <a key={img.url} href={img.url} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={img.url}
                    alt=""
                    width={img.width}
                    height={img.height}
                    sizes="(max-width: 760px) 50vw, 360px"
                  />
                  <span className="sr-only">Зургийг томоор харах</span>
                </a>
              ))}
            </div>
          )}

          {a.files.length > 0 && (
            <ul className={styles.files}>
              {a.files.map((f) => (
                <li key={f.url}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    <span className={styles.fileBadge}>PDF</span>
                    <span className={styles.fileName}>{f.name}</span>
                    <span className={styles.fileSize}>{formatSize(f.size)} · Нээх ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          )}

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

          <Share label="Мэдээг share хийх" />
        </article>
      </main>
      <Footer share={false} />
    </>
  );
}
