import { Logo } from '@/components/Logo/Logo';
import { Share } from '@/components/Share/Share';
import { site } from '@/content/site';
import styles from './Footer.module.css';

/** `share`: off on article pages, which have their own share prompt. */
export function Footer({ share = true }: { share?: boolean } = {}) {
  return (
    <footer className={styles.footer}>
      <Logo full className={styles.logo} />
      <span>
        © {site.year} {site.author}
      </span>
      {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
      <span className={styles.social}>
        <a href={site.facebook.page} target="_blank" rel="noopener">
          Facebook хуудас
        </a>
        <a href={site.facebook.messenger} target="_blank" rel="noopener">
          Messenger-ээр асуух
        </a>
      </span>
      {share && <Share tone="light" />}
    </footer>
  );
}
