'use client';

import { useEffect } from 'react';
import styles from './TapMark.module.css';

/**
 * Phones have no cursor, so the brand hand appears where the finger taps and
 * fades away. Mouse users get the hand as their cursor instead (globals.css).
 * Skipped on the admin dashboard and for people who prefer reduced motion.
 */
export function TapMark() {
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !e.isPrimary) return;
      const mark = document.createElement('span');
      mark.className = styles.mark ?? '';
      mark.setAttribute('aria-hidden', 'true');
      // The fingertip of the mark sits on the tap point.
      mark.style.left = `${e.clientX}px`;
      mark.style.top = `${e.clientY}px`;
      document.body.append(mark);
      mark.addEventListener('animationend', () => mark.remove(), { once: true });
      setTimeout(() => mark.remove(), 1500); // in case the animation never runs
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
  return null;
}
