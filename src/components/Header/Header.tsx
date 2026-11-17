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

  // Highlight the nav link for the section currently in the middle of the screen.
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector<HTMLElement>(l.href))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = `#${e.target.id}`;
          setActive((prev) => (e.isIntersecting ? id : prev === id ? null : prev));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [links]);

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
        {open ? 'Хаах' : 'Цэс'}
      </button>
      <nav
        id="primary-nav"
        aria-label="Үндсэн цэс"
        className={`${styles.links} ${open ? styles.open : ''}`}
        onClick={(e) => (e.target as HTMLElement).tagName === 'A' && setOpen(false)}
      >
        {links.map((l) => (
          <a key={l.href} href={l.href} aria-current={active === l.href ? 'location' : undefined}>
            {l.label}
          </a>
        ))}
        <a className={styles.navOrder} href="#order">
          Ном захиалах
        </a>
      </nav>
      {open && <div className={styles.backdrop} aria-hidden="true" onClick={() => setOpen(false)} />}
      <a className={`btn btn--sm ${styles.cta}`} href="#order">
        Захиалах
      </a>
    </header>
  );
}
