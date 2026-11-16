const formatter = new Intl.NumberFormat('en-US');

/** Formats a tugrik amount as "₮45,000". */
export function formatMNT(amount: number): string {
  return `₮${formatter.format(amount)}`;
}
