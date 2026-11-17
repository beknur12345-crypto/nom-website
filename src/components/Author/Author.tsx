import Image from 'next/image';
import photo from '@/assets/author.webp';
import { site } from '@/content/site';
import styles from './Author.module.css';

export function Author() {
  return (
    <div className={styles.author} id="author">
      <p className="eyebrow eyebrow--light">06 · Зохиогч</p>
      <Image
        className={styles.portrait}
        src={photo}
        alt={`${site.author}: хар пиджактай, хоёр гараараа урагш заан зогсож байна`}
        sizes="(max-width: 1180px) min(100vw, 480px), 440px"
        placeholder="blur"
      />
      <h3>{site.author}</h3>
      {site.authorBio.map((p) => (
        <p key={p.slice(0, 24)}>{p}</p>
      ))}
    </div>
  );
}
