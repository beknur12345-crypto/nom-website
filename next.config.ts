import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

/** Photos and PDFs uploaded from the admin dashboard live in Vercel Blob. */
const BLOB_HOST = 'https://*.public.blob.vercel-storage.com';

/**
 * Only this site's own files may load. 'unsafe-inline' is needed for Next.js's
 * inline bootstrap scripts without nonces; nonces would force every page to
 * render per request and lose static/ISR caching.
 */
const csp = [
  "default-src 'self'",
  // In production Vercel Analytics is served from this domain (/_vercel/insights); in dev it loads from Vercel's CDN.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${BLOB_HOST}`,
  "font-src 'self'",
  // vercel.com/api/blob receives the admin's direct uploads.
  `connect-src 'self' https://vercel.com ${BLOB_HOST}${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/medee/**' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
