import { site } from '@/content/site';
import { formatMNT } from '@/lib/money';
import { isPriceSet } from '@/lib/pricing';

export const PRICE_PLACEHOLDER = '₮00,000';

/** Shows the book price, or a placeholder until the price is set in content/site.ts. */
export function Price({ className }: { className?: string }) {
  return (
    <span className={className}>{isPriceSet() ? formatMNT(site.pricing.unitPrice) : PRICE_PLACEHOLDER}</span>
  );
}
