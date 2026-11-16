'use client';

import { useState } from 'react';
import type { Quote } from '@/content/site';
import { parseRedacted } from './parse';
import styles from './Quotes.module.css';

function RedactedWord({ word }: { word: string }) {
  const [open, setOpen] = useState(false);
  if (open) return <span className={`${styles.redacted} ${styles.revealed}`}>{word}</span>;
  return (
    <button
      type="button"
      className={styles.redacted}
      aria-label="Нуугдсан үгийг нээх"
      onClick={() => setOpen(true)}
    >
      {word}
    </button>
  );
}

export function Quotes({ quotes }: { quotes: readonly Quote[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className={styles.quotes} id="quotes">
      <p className="eyebrow eyebrow--light">02 · Онцлох эшлэл</p>
      <div className={styles.mark} aria-hidden="true">
        “
      </div>
      <div className={styles.list} aria-live="polite">
        {quotes.map((q, i) => (
          <figure key={i} hidden={i !== active}>
            <blockquote>
              {parseRedacted(q.text).map((s, j) =>
                s.redacted ? <RedactedWord key={j} word={s.text} /> : <span key={j}>{s.text}</span>,
              )}
            </blockquote>
            <figcaption>{q.source}</figcaption>
          </figure>
        ))}
      </div>
      <div className={styles.bar}>
        <span>Хар зураас дээр дарж үгийг нээнэ үү</span>
        {quotes.length > 1 && (
          <span className={styles.dots}>
            {quotes.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Эшлэл ${i + 1}`}
                aria-pressed={i === active}
                className={i === active ? styles.on : undefined}
                onClick={() => setActive(i)}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
