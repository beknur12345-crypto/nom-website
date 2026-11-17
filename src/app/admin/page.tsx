import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminBar } from '@/components/Admin/AdminBar';
import { LoginForm, StockForm, TestNotification } from '@/components/Admin/ClientBits';
import { OrderCard } from '@/components/Admin/OrderCard';
import styles from '@/components/Admin/Admin.module.css';
import { site } from '@/content/site';
import { isAdminConfigured, isSignedIn } from '@/lib/admin-auth';
import { getOrders, getStats, isStatus } from '@/lib/admin-orders';
import { ORDER_STATUSES, STATUS_LABELS } from '@/lib/labels';
import { formatMNT } from '@/lib/money';
import { getStock } from '@/lib/stock';
import { isTelegramConfigured } from '@/lib/telegram';

export const metadata: Metadata = {
  title: 'Захиалгын самбар',
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }: PageProps<'/admin'>) {
  if (!isAdminConfigured()) notFound();

  if (!(await isSignedIn())) {
    return (
      <div className={styles.admin}>
        <div className={styles.login}>
          <p className={styles.brand}>{site.title}</p>
          <h1>Захиалгын самбар</h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const status = isStatus(params.status) ? params.status : undefined;
  const q = typeof params.q === 'string' ? params.q : '';
  const [stats, list, stock] = await Promise.all([getStats(), getOrders({ status, q }), getStock()]);
  const hrefFor = (s?: string) => (s ? `/admin?status=${s}` : '/admin');

  return (
    <div className={styles.admin}>
      <AdminBar active="orders" title="Захиалгууд" refresh />

      <main className={styles.body}>
        {!stats ? (
          <p className={styles.notice}>
            Өгөгдлийн сан холбогдоогүй байна (DATABASE_URL). Захиалга хадгалагдахгүй туршилтын горимд байна.
          </p>
        ) : (
          <section className={styles.stats} aria-label="Тойм">
            <div className={styles.stat} data-tone={stats.counts.new > 0 ? 'alert' : undefined}>
              <span>Шинэ захиалга</span>
              <b>{stats.counts.new}</b>
            </div>
            <div className={styles.stat}>
              <span>Авах төлбөр</span>
              <b>{stats.toCollect > 0 ? formatMNT(stats.toCollect) : '—'}</b>
            </div>
            <div className={styles.stat}>
              <span>Орлого</span>
              <b>{stats.revenue > 0 ? formatMNT(stats.revenue) : '—'}</b>
            </div>
            <div className={styles.stat}>
              <span>Зарагдсан ном</span>
              <b>{stats.booksSold}</b>
            </div>
            <div
              className={`${styles.stat} ${styles.stockStat}`}
              data-tone={stock !== null && stock <= 10 ? 'alert' : undefined}
            >
              <span>Үлдэгдэл</span>
              {stock === null ? <b>—</b> : <b>{stock} ширхэг</b>}
              {stock !== null && <StockForm stock={stock} />}
            </div>
          </section>
        )}

        <nav className={styles.tabs} aria-label="Төлөвөөр шүүх">
          <Link href={hrefFor()} aria-current={!status ? 'page' : undefined}>
            Бүгд <span>{stats?.counts.all ?? 0}</span>
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link key={s} href={hrefFor(s)} aria-current={status === s ? 'page' : undefined} data-status={s}>
              {STATUS_LABELS[s]} <span>{stats?.counts[s] ?? 0}</span>
            </Link>
          ))}
        </nav>

        <form className={styles.search} role="search" action="/admin">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="q" className="sr-only">
            Хайх
          </label>
          <input
            id="q"
            className="input"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Нэр, утас эсвэл №-ээр хайх"
          />
          <button className="btn btn--sm" type="submit">
            Хайх
          </button>
          {q && (
            <Link className={styles.clear} href={hrefFor(status)}>
              Цэвэрлэх
            </Link>
          )}
        </form>

        {list.length === 0 ? (
          <div className={styles.empty}>
            <h2>{q || status ? 'Тохирох захиалга алга' : 'Одоогоор захиалга алга'}</h2>
            <p>
              {q || status
                ? 'Шүүлтүүрээ өөрчилж үзнэ үү.'
                : 'Захиалга ирмэгц энд гарч ирэх бөгөөд утсанд тань мэдэгдэл очно.'}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {list.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </main>

      <footer className={styles.foot}>
        <span>
          Telegram мэдэгдэл:{' '}
          {isTelegramConfigured() ? (
            <b className={styles.ok}>Холбогдсон</b>
          ) : (
            <b className={styles.off}>Холбогдоогүй</b>
          )}
        </span>
        {isTelegramConfigured() && <TestNotification />}
      </footer>
    </div>
  );
}
