'use client';

import { useEffect, useState } from 'react';
import styles from './AnnouncementBar.module.css';

const STORAGE_KEY = 'announcementDismissed';

/** Dismissal is remembered per message, so a new announcement shows again. */
export function AnnouncementBar({ message }: { message: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      // Reading browser storage is only possible after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(STORAGE_KEY) === message) setHidden(true);
    } catch {
      /* storage unavailable: keep it visible */
    }
  }, [message]);

  if (hidden) return null;

  return (
    <div className={styles.bar} role="region" aria-label="Зар">
      <p>
        <b className={styles.tag}>Зар</b>
        {message}
      </p>
      <button
        type="button"
        className={styles.close}
        aria-label="Зарыг хаах"
        onClick={() => {
          try {
            localStorage.setItem(STORAGE_KEY, message);
          } catch {
            /* ignore */
          }
          setHidden(true);
        }}
      >
        ✕
      </button>
    </div>
  );
}
