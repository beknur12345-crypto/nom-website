import type { Review } from '@/content/site';
import styles from './Reviews.module.css';

export function Reviews({ reviews }: { reviews: readonly Review[] }) {
  return (
    <div className={styles.reviews} id="reviews">
      <p className="eyebrow">05</p>
      <h2>Уншигчдын сэтгэгдэл</h2>
      <div className={styles.grid}>
        {reviews.map((r, i) => (
          <figure key={i}>
            <blockquote>“{r.quote}”</blockquote>
            <figcaption>
              <b>{r.name}</b>
              {r.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
