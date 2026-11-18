'use client';

import { useEffect, useState } from 'react';
import type { NavLink } from '@/content/site';
import { Logo } from '@/components/Logo/Logo';
import styles from './Header.module.css';

/**
 * `home`: on the home page links are in-page anchors; elsewhere they point back to "/#…".
 * `orderCta`: the "Захиалах" buttons; off on reading pages (articles).
 */
export function Header({
  links,
  home = true,
  orderCta = true,
}: {
  links: readonly NavLink[];
  home?: boolean;
  orderCta?: boolean;
}) {
  const prefix = home ? '' : '/';
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
    if (!home) return;
    const sections = links
      .filter((l) => l.href.startsWith('#'))
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
  }, [links, home]);

  return (
    <header className={styles.nav} id="top">
      <a className={styles.logo} href={home ? '#top' : '/'}>
        <Logo />
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
          <a
            key={l.href}
            href={l.href.startsWith('#') ? prefix + l.href : l.href}
            aria-current={active === l.href ? 'location' : undefined}
          >
            {l.label}
          </a>
        ))}
        {orderCta && (
          <a className={styles.navOrder} href={`${prefix}#order`}>
            Ном захиалах
          </a>
        )}
      </nav>
      {open && <div className={styles.backdrop} aria-hidden="true" onClick={() => setOpen(false)} />}
      {orderCta && (
        <a className={`btn btn--sm ${styles.cta}`} href={`${prefix}#order`}>
          Захиалах
        </a>
      )}
    </header>
  );
}
