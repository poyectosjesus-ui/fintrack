export function formatAmount(amount: number | string): string {
  const num = Number(amount);
  if (isNaN(num)) return '0.00';
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatCompact(amount: number | string): string {
  const num = Number(amount);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('es-MX', {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1
  }).format(num);
}
