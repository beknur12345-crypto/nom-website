import { site } from '@/content/site';
import styles from './Author.module.css';

export function Author() {
  return (
    <div className={styles.author} id="author">
      <p className="eyebrow eyebrow--light">05 · Зохиогч</p>
      {/* Replace with next/image once the author photo is available. */}
      <div className={styles.portrait}>Зохиогчийн зураг</div>
      <h3>{site.author}</h3>
      <p>{site.authorBio}</p>
    </div>
  );
}
