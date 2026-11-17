import Image from 'next/image';
import photo from '@/assets/author.webp';
import { site } from '@/content/site';
import styles from './Author.module.css';

export function Author() {
  return (
    <section className={styles.author} id="author" aria-labelledby="author-title">
      <Image
        className={styles.portrait}
        src={photo}
        alt={`${site.author}: хар пиджактай, хоёр гараараа урагш заан зогсож байна`}
        sizes="(max-width: 900px) min(100vw, 440px), 440px"
        placeholder="blur"
      />
      <div className={styles.text}>
        <p className="eyebrow eyebrow--light">03 · Зохиогчийн тухай</p>
        <h2 id="author-title">{site.author}</h2>
        {site.authorBio.map((p, i) => (
          <p key={p.slice(0, 24)} className={i === 0 ? styles.lede : undefined}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
