import Image from 'next/image';
import cover from '@/assets/book.webp';
import { site } from '@/content/site';
import { Price } from '@/components/Price';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <svg className={styles.bands} viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="880,0 1200,0 1440,250 1440,760 1270,760" fill="#E3C99C" />
        <polygon points="1200,0 1440,0 1440,250" fill="#6E251D" />
        <polygon points="0,500 0,760 270,760" fill="#6E251D" />
      </svg>
      <div className={styles.text}>
        <h1>
          Улс
          <br />
          төрийн
          <br />
          тулаан
        </h1>
        <p className={styles.sub}>{site.tagline}</p>
        <p className={styles.by}>
          {site.author} · {site.year} · <span lang="en">{site.inspiredBy}</span>
        </p>
        <div className={styles.cta}>
          <a className="btn" href="#order">
            Ном захиалах
          </a>
          <Price className={styles.price} />
          <a className={styles.ghost} href="#book">
            Номын тухай →
          </a>
        </div>
      </div>
      <Image
        className={styles.book}
        src={cover}
        alt="“Улс төрийн тулаан” номын хавтас: хоёр хуруугаа өргөсөн гар, хурууны үзүүрээс утаа савсана"
        priority
        sizes="(max-width: 900px) min(72vw, 340px), 500px"
        placeholder="blur"
      />
    </section>
  );
}
