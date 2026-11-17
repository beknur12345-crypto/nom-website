'use client';

import { Analytics } from '@vercel/analytics/next';

/** Cookieless visit counts (Vercel Web Analytics). The admin dashboard is not tracked. */
export function SiteAnalytics() {
  return <Analytics beforeSend={(e) => (new URL(e.url).pathname.startsWith('/admin') ? null : e)} />;
}
