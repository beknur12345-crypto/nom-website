import type { Metadata } from 'next';
import { ArticleCard } from '@/components/Articles/ArticleCard';
import styles from '@/components/Articles/Articles.module.css';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { MobileOrderBar } from '@/components/MobileOrderBar/MobileOrderBar';
import { site } from '@/content/site';
import { getPublishedArticles } from '@/lib/articles';
import { formatMNT } from '@/lib/money';
import { navLinks } from '@/lib/nav';
import { isPriceSet } from '@/lib/pricing';

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Нийтлэл | ${site.title}`,
  description: `${site.author}: улс төр, стратегийн харилцааны тухай нийтлэлүүд.`,
  alternates: { canonical: '/niitlel' },
};

export default async function ArticlesPage() {
  const list = await getPublishedArticles();
  return (
    <>
      <Header links={navLinks({ hasArticles: list.length > 0, home: false })} home={false} />
      <main id="main" className={styles.page}>
        <h1>Нийтлэл</h1>
        {list.length === 0 ? (
          <p className={styles.excerpt} style={{ marginTop: 24 }}>
            Удахгүй нийтлэл нэмэгдэнэ.
          </p>
        ) : (
          <div className={styles.list}>
            {list.map((a) => (
              <ArticleCard key={a.id} article={a} headingLevel={2} />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <MobileOrderBar href="/#order" price={isPriceSet() ? formatMNT(site.pricing.unitPrice) : null} />
    </>
  );
}
