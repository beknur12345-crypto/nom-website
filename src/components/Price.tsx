import { site } from '@/content/site';
import { formatMNT } from '@/lib/money';
import { isPriceSet } from '@/lib/pricing';

/** Shows the book price; renders nothing until the price is set in content/site.ts. */
export function Price({ className }: { className?: string }) {
  if (!isPriceSet()) return null;
  return <span className={className}>{formatMNT(site.pricing.unitPrice)}</span>;
}
