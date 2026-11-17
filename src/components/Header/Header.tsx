'use client';

import { useEffect, useState } from 'react';
import { type NavLink, site } from '@/content/site';
import styles from './Header.module.css';

export function Header({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={styles.nav} id="top">
      <a className={styles.logo} href="#top">
        {site.title}
      </a>
      <button
        className={styles.menu}
        type="button"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((o) => !o)}
      >
        Цэс
      </button>
      <nav
        id="primary-nav"
        aria-label="Үндсэн цэс"
        className={`${styles.links} ${open ? styles.open : ''}`}
        onClick={(e) => (e.target as HTMLElement).tagName === 'A' && setOpen(false)}
      >
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className={`btn btn--sm ${styles.cta}`} href="#order">
        Захиалах
      </a>
    </header>
  );
}
