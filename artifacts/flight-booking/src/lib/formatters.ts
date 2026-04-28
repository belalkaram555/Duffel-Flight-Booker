export function formatCurrency(amount: string | number | null | undefined, currency?: string | null) {
  if (amount == null) return '—';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '—';
  if (!currency) {
    return numericAmount.toFixed(2);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numericAmount);
}

export function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoString));
}

export function formatDate(isoString: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoString));
}

export function formatDuration(duration: string) {
  // Parse ISO 8601 duration (e.g. PT2H30M)
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  
  const hours = match[1] ? match[1].replace('H', '') : '0';
  const minutes = match[2] ? match[2].replace('M', '') : '0';
  
  if (hours === '0') return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}
