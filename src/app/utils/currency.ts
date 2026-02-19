// Currency conversion utilities
// Fixed exchange rate: 1 EUR = 1.95583 BGN

const EUR_TO_BGN_RATE = 1.95583;

/**
 * Convert EUR to BGN
 */
export function eurToBgn(eur: number): number {
  return eur * EUR_TO_BGN_RATE;
}

/**
 * Format price with both EUR and BGN
 * @param eur - Price in EUR
 * @param showBgn - Whether to show BGN (default: true)
 * @returns Formatted string like "€50 (97.79 лв)"
 */
export function formatPrice(eur: number, showBgn: boolean = true): string {
  if (!showBgn) {
    return `€${eur.toFixed(2)}`;
  }
  const bgn = eurToBgn(eur);
  return `€${eur.toFixed(2)} (${bgn.toFixed(2)} лв)`;
}

/**
 * Format price for display - compact version
 * @param eur - Price in EUR
 * @returns Formatted string like "€50 / 97.79 лв"
 */
export function formatPriceCompact(eur: number): string {
  const bgn = eurToBgn(eur);
  return `€${eur.toFixed(2)} / ${bgn.toFixed(2)} лв`;
}

/**
 * Format price - EUR only on one line, BGN on second line
 */
export function formatPriceTwoLine(eur: number): { eur: string; bgn: string } {
  const bgn = eurToBgn(eur);
  return {
    eur: `€${eur.toFixed(2)}`,
    bgn: `${bgn.toFixed(2)} лв`
  };
}
