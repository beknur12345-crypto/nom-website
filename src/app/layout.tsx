import type { Metadata, Viewport } from 'next';
import { Manrope, Oswald } from 'next/font/google';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { site } from '@/content/site';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const fullTitle = `${site.title} | ${site.author}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: fullTitle,
  description: site.description,
  applicationName: site.title,
  authors: [{ name: site.author }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'book',
    locale: 'mn_MN',
    url: '/',
    siteName: site.title,
    title: fullTitle,
    description: site.description,
  },
  twitter: { card: 'summary_large_image', title: fullTitle, description: site.description },
};

export const viewport: Viewport = { themeColor: '#8C3328', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={`${oswald.variable} ${manrope.variable}`}>
      <body>
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
