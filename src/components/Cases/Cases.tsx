import type { CaseStudy } from '@/content/site';
import styles from './Cases.module.css';

const VARIANTS = [styles.light, styles.dark, styles.cream] as const;

export function Cases({ cases }: { cases: readonly CaseStudy[] }) {
  return (
    <section className={styles.cases} id="cases" aria-labelledby="cases-title">
      <div className={styles.head}>
        <div>
          <p className="eyebrow eyebrow--light">03</p>
          <h2 id="cases-title">Кейс судалгаа</h2>
        </div>
        <p>Кейс бүрийг нөхцөл байдал, стратеги, үр дүн гэсэн гурван хэсгээр товч харуулна.</p>
      </div>
      <div className={styles.cards}>
        {cases.map((c, i) => (
          <article key={i} className={VARIANTS[i % VARIANTS.length]}>
            <div className={styles.num} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </div>
            <h3>{c.title}</h3>
            <dl>
              <div className={styles.row}>
                <dt>Нөхцөл байдал</dt>
                <dd>{c.situation}</dd>
              </div>
              <div className={styles.row}>
                <dt>Стратеги</dt>
                <dd>{c.strategy}</dd>
              </div>
              <div className={styles.row}>
                <dt>Үр дүн</dt>
                <dd>{c.result}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
