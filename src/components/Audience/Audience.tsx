import { site } from '@/content/site';
import styles from './Audience.module.css';

export function Audience() {
  const a = site.audience;
  return (
    <section className={styles.audience} id="audience" aria-labelledby="audience-title">
      <div className={styles.main}>
        <p className="eyebrow">03</p>
        <h2 id="audience-title">Хэнд зориулсан бэ?</h2>
        {a.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <p className={styles.answer}>{a.answer}</p>
      </div>
      <aside className={styles.side} aria-label="Монголын улс төрийн орчин">
        <p>{a.context}</p>
        <figure className={styles.quote}>
          <blockquote>
            <p>“{a.quote.text}”</p>
          </blockquote>
          <figcaption>— {a.quote.source}</figcaption>
        </figure>
        <p>{a.note}</p>
      </aside>
    </section>
  );
}
