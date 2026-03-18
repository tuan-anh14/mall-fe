const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function formatCurrency(amount: number): string {
  return formatter.format(Math.round(amount));
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ ₫`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} triệu ₫`; // cspell:ignore triệu
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ₫`;
  return formatter.format(Math.round(amount));
}
