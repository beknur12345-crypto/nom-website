import { site } from '@/content/site';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>
        © {site.year} {site.author}
      </span>
      <a href={`mailto:${site.email}`}>{site.email}</a>
    </footer>
  );
}
