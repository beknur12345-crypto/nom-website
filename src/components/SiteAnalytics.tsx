'use client';

import { Analytics } from '@vercel/analytics/next';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Cookieless visit counts: Vercel Web Analytics, plus our own anonymous
 * page-view log for the admin "Зочид" tab. The admin dashboard is not tracked.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  const first = useRef(true);
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    // Never count the same page twice in a row (re-renders, React dev double effects).
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    // Only the first page of a visit carries the outside referrer; later clicks are internal.
    const body = JSON.stringify({
      path: pathname,
      referrer: first.current ? document.referrer : '',
      query: first.current ? location.search : '',
      internal: !first.current,
    });
    first.current = false;
    try {
      if (!navigator.sendBeacon?.('/api/visit', new Blob([body], { type: 'application/json' }))) {
        void fetch('/api/visit', { method: 'POST', body, keepalive: true }).catch(() => {});
      }
    } catch {
      /* Counting visits must never break the page. */
    }
  }, [pathname]);

  return <Analytics beforeSend={(e) => (new URL(e.url).pathname.startsWith('/admin') ? null : e)} />;
}
