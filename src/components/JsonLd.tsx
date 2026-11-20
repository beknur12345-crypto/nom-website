import cover from '@/assets/book.webp';
import { site } from '@/content/site';
import { isPriceSet } from '@/lib/pricing';

/** Book structured data for search engines. */
export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: site.title,
    author: { '@type': 'Person', name: site.author },
    inLanguage: 'mn',
    datePublished: String(site.year),
    description: site.description,
    image: new URL(cover.src, site.url).toString(),
    url: site.url,
    sameAs: [site.facebook.page],
    ...(site.book.pages ? { numberOfPages: site.book.pages } : {}),
    ...(isPriceSet()
      ? {
          offers: {
            '@type': 'Offer',
            price: site.pricing.unitPrice,
            priceCurrency: 'MNT',
            availability: 'https://schema.org/InStock',
            url: `${site.url}/#order`,
          },
        }
      : {}),
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped is safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
