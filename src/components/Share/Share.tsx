'use client';

import { useState, useSyncExternalStore } from 'react';
import { site } from '@/content/site';
import styles from './Share.module.css';

const noop = () => () => {};
const shareText = `“${site.title}”: ${site.tagline}`;

/** Share the site: native share sheet on phones (Messenger, Viber, …), Facebook and copy link everywhere. */
export function Share({ tone = 'dark', label = 'Share хийх' }: { tone?: 'dark' | 'light'; label?: string }) {
  // false on the server, real value in the browser: no hydration mismatch.
  const canNative = useSyncExternalStore(
    noop,
    () => 'share' in navigator,
    () => false,
  );
  const [copied, setCopied] = useState(false);

  const url = site.url;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className={styles.share} data-tone={tone}>
      <span className={styles.label}>{label}</span>
      <div className={styles.buttons}>
        {canNative && (
          <button
            type="button"
            onClick={() => navigator.share({ title: site.title, text: shareText, url }).catch(() => {})}
          >
            Share
          </button>
        )}
        <a href={fb} target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              /* clipboard blocked */
            }
          }}
        >
          {copied ? 'Хуулсан ✓' : 'Линк хуулах'}
        </button>
      </div>
    </div>
  );
}
