import Link from 'next/link';
import { logout } from '@/app/admin/actions';
import { site } from '@/content/site';
import { AutoRefresh } from './ClientBits';
import styles from './Admin.module.css';

export function AdminBar({
  active,
  title,
  refresh = false,
}: {
  active: 'orders' | 'articles';
  title: string;
  refresh?: boolean;
}) {
  return (
    <header className={styles.bar}>
      <div>
        <p className={styles.brand}>{site.title}</p>
        <h1>{title}</h1>
      </div>
      <div className={styles.barActions}>
        {refresh && <AutoRefresh />}
        {active === 'orders' && (
          <a className={styles.barLink} href="/admin/export" download>
            Excel татах
          </a>
        )}
        <form action={logout}>
          <button className={styles.barLink} type="submit">
            Гарах
          </button>
        </form>
      </div>
      <nav className={styles.sections} aria-label="Самбарын хэсгүүд">
        <Link href="/admin" aria-current={active === 'orders' ? 'page' : undefined}>
          Захиалга
        </Link>
        <Link href="/admin/niitlel" aria-current={active === 'articles' ? 'page' : undefined}>
          Мэдээ
        </Link>
        <Link href="/" target="_blank">
          Сайт үзэх ↗
        </Link>
      </nav>
    </header>
  );
}
