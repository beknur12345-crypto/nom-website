import Image from 'next/image';
import clausewitz from '@/assets/clausewitz.webp';
import { site } from '@/content/site';
import styles from './About.module.css';

export function About() {
  const [first, ...rest] = site.book.intro;
  return (
    <section className={styles.about} id="book" aria-labelledby="book-title">
      <div className={styles.grid}>
        <div className={styles.text}>
          <p className="eyebrow">01</p>
          <h2 id="book-title">Номын тухай</h2>
          <p className={styles.lede}>{first}</p>
          {rest.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <figure className={styles.figure}>
          <Image
            src={clausewitz}
            alt="Карл фон Клаузевицын хөрөг: цэргийн дүрэмт хувцастай, цээжиндээ одон медаль зүүсэн"
            sizes="(max-width: 900px) min(100vw, 420px), 400px"
            placeholder="blur"
          />
          <figcaption>
            Карл фон Клаузевиц (1780–1831)
            <span>“Vom Kriege” — “Дайтахуй” номын зохиогч</span>
          </figcaption>
        </figure>
      </div>
      <p className={styles.thesis}>{site.book.thesis}</p>
    </section>
  );
}
