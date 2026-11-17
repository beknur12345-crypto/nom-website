'use client';

import { useEffect, useState } from 'react';
import styles from './MobileOrderBar.module.css';

/** Sticky "order" bar on phones; hides while the order section is on screen. */
export function MobileOrderBar({ price }: { price: string | null }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById('order');
    if (!target || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(Boolean(entry?.isIntersecting)));
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <a className={`${styles.bar} ${hidden ? styles.off : ''}`} href="#order">
      <span>Ном захиалах</span>
      {price && <span>{price}</span>}
    </a>
  );
}
