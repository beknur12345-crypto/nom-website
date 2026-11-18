import { site } from '@/content/site';
import { FULL_LOGO, WORDMARK } from './paths';
import styles from './Logo.module.css';

/**
 * The book's wordmark as inline SVG, so it stays sharp and takes its colours
 * from CSS: letters use `currentColor`, the tie uses `--logo-accent`.
 * `full` adds the author line and "Inspired by the book Vom Kriege".
 */
export function Logo({ full = false, className }: { full?: boolean; className?: string }) {
  const art = full ? FULL_LOGO : WORDMARK;
  const label = full ? `${site.author}: ${site.title}. ${site.inspiredBy}` : site.title;
  return (
    <svg className={`${styles.logo} ${className ?? ''}`} viewBox={art.viewBox} role="img" aria-label={label}>
      <g transform={art.transform}>
        <path d={art.ink} fill="currentColor" />
        <path d={art.accent} className={styles.accent} />
      </g>
    </svg>
  );
}
