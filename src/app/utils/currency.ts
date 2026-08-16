/**
 * Format price in EUR only
 */
export function formatPrice(eur: number): string {
  return `€${eur.toFixed(2)}`;
}

/**
 * Format price - compact EUR only
 */
export function formatPriceCompact(eur: number): string {
  return `€${eur.toFixed(2)}`;
}

/**
 * Format price - EUR only (kept for backward compat)
 */
export function formatPriceTwoLine(eur: number): { eur: string; bgn: string } {
  return {
    eur: `€${eur.toFixed(2)}`,
    bgn: ''
  };
}
