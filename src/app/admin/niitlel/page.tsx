import type { Metadata } from 'next';
import Link from 'next/link';
import { deleteArticle, setPublished } from '@/app/admin/article-actions';
import { AdminBar } from '@/components/Admin/AdminBar';
import { ConfirmSubmit, Submit } from '@/components/Admin/ClientBits';
import { adminGate } from '@/components/Admin/gate';
import styles from '@/components/Admin/Admin.module.css';
import { formatDay } from '@/lib/article-text';
import { getAllArticles } from '@/lib/articles';

export const metadata: Metadata = { title: 'Мэдээ | Самбар', robots: { index: false, follow: false } };

export default async function ArticlesAdmin({ searchParams }: PageProps<'/admin/niitlel'>) {
  const gate = await adminGate();
  if (gate) return gate;
  const { saved } = await searchParams;
  const list = await getAllArticles();

  return (
    <div className={styles.admin}>
      <AdminBar active="articles" title="Мэдээ" />
      <main className={styles.body}>
        {saved && (
          <p className={styles.flash} role="status">
            {saved === 'published' ? 'Нийтлэгдлээ ✓ Сайт дээр харагдаж байна.' : 'Ноорог хадгалагдлаа ✓'}
          </p>
        )}
        <div className={styles.toolbar}>
          <p>
            Нийтлэгдсэн мэдээнүүд нүүр хуудасны “Мэдээ мэдээлэл” хэсэг болон{' '}
            <Link href="/niitlel">/niitlel</Link> хуудсанд гарна.
          </p>
          <Link className="btn btn--sm" href="/admin/niitlel/new">
            + Шинэ мэдээ
          </Link>
        </div>

        {list.length === 0 ? (
          <div className={styles.empty}>
            <h2>Мэдээ алга</h2>
            <p>Эхний мэдээгээ нэмэхэд сайт дээр “Мэдээ мэдээлэл” хэсэг автоматаар гарч ирнэ.</p>
          </div>
        ) : (
          <ul className={styles.articleList}>
            {list.map((a) => (
              <li key={a.id} className={styles.articleRow} data-published={a.isPublished}>
                <div>
                  <span className={styles.badge} data-status={a.isPublished ? 'delivered' : 'cancelled'}>
                    {a.isPublished ? 'Нийтлэгдсэн' : 'Ноорог'}
                  </span>{' '}
                  <time dateTime={a.publishedOn}>{formatDay(a.publishedOn)}</time>
                  <h3 className={styles.name}>{a.title}</h3>
                </div>
                <div className={styles.rowActions}>
                  <Link href={`/admin/niitlel/${a.id}`}>Засах</Link>
                  {a.isPublished && (
                    <Link href={`/niitlel/${a.slug}`} target="_blank">
                      Үзэх ↗
                    </Link>
                  )}
                  <form action={setPublished}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="publish" value={a.isPublished ? '0' : '1'} />
                    <Submit className={styles.linkButton}>
                      {a.isPublished ? 'Сайтаас авах' : 'Нийтлэх'}
                    </Submit>
                  </form>
                  <form action={deleteArticle}>
                    <input type="hidden" name="id" value={a.id} />
                    <ConfirmSubmit message={`“${a.title}” мэдээг устгах уу? Буцаах боломжгүй.`}>
                      Устгах
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
