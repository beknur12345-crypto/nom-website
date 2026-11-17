import Image from 'next/image';
import clausewitz from '@/assets/clausewitz.webp';
import { site } from '@/content/site';
import styles from './About.module.css';

export function About() {
  const facts = [
    { label: 'Он', value: String(site.year) },
    { label: 'Хэл', value: site.book.language },
    { label: 'Хуудас', value: site.book.pages ? String(site.book.pages) : '000' },
  ];
  const [first, ...rest] = site.book.intro;
  return (
    <div className={styles.about} id="book">
      <p className="eyebrow">01</p>
      <h2>Номын тухай</h2>
      <p className={styles.lede}>{first}</p>
      <div className={styles.body}>
        <figure className={styles.figure}>
          <Image
            src={clausewitz}
            alt="Карл фон Клаузевицын хөрөг: цэргийн дүрэмт хувцастай, цээжиндээ одон медаль зүүсэн"
            sizes="(max-width: 560px) 100vw, 240px"
            placeholder="blur"
          />
          <figcaption>Карл фон Клаузевиц (1780–1831), “Vom Kriege” номын зохиогч</figcaption>
        </figure>
        {rest.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <p className={styles.thesis}>{site.book.thesis}</p>
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
