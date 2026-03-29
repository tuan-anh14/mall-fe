export const FREE_SHIPPING_THRESHOLD = 50000;
export const DEFAULT_SHIPPING_COST = 50000;
export const VAT_RATE = 0.1;

const formatter = new Intl.NumberFormat('vi-VN', { 
  style: 'currency', 
  currency: 'VND',
  maximumFractionDigits: 0
});

export function formatCurrency(amount: number): string {
  return formatter.format(Math.round(amount));
}

export function formatCurrencyCompact(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded >= 1_000_000_000) return `${(rounded / 1_000_000_000).toFixed(1)} tỷ ₫`;
  if (rounded >= 1_000_000) return `${(rounded / 1_000_000).toFixed(1)} triệu ₫`;
  if (rounded >= 1_000) return `${(rounded / 1_000).toFixed(0)}K ₫`;
  return formatter.format(rounded);
}

