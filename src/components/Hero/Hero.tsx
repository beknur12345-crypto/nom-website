import Image from 'next/image';
import cover from '@/assets/hero-cover.webp';
import crowd from '@/assets/hero-crowd.webp';
import { site } from '@/content/site';
import { Price } from '@/components/Price';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <Image
        className={styles.backdrop}
        src={crowd}
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        placeholder="blur"
      />
      <div className={styles.shade} aria-hidden="true" />
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
          <b>{site.author}</b>, {site.year}
          <span lang="en">{site.inspiredBy}</span>
        </p>
        <div className={styles.cta}>
          <a className="btn" href="#order">
            Ном захиалах
          </a>
          <Price className={styles.price} />
          <a className={styles.ghost} href="#book">
            Номын тухай
          </a>
        </div>
      </div>
      <Image
        className={styles.book}
        src={cover}
        alt="“Улс төрийн тулаан” номын хавтас: хоёр хуруугаа өргөсөн гар, хурууны үзүүрээс утаа савсана"
        preload
        sizes="(max-width: 900px) min(72vw, 340px), 500px"
        placeholder="blur"
      />
    </section>
  );
}
