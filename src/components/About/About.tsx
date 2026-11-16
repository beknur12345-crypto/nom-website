import { site } from '@/content/site';
import styles from './About.module.css';

export function About() {
  const facts = [
    { label: 'Он', value: String(site.year) },
    { label: 'Хэл', value: site.book.language },
    { label: 'Хуудас', value: site.book.pages ? String(site.book.pages) : '000' },
  ];
  return (
    <div className={styles.about} id="book">
      <p className="eyebrow">01</p>
      <h2>Номын тухай</h2>
      <p className={styles.summary}>{site.book.summary}</p>
      <ol className={styles.topics}>
        {site.book.topics.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
      <dl className={styles.facts}>
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
