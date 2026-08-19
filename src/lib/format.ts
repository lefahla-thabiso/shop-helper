/** Currency symbol — change this one line if you use a different currency. */
export const CURRENCY_SYMBOL = 'M'; // Lesotho loti (LSL)

/**
 * SQLite's datetime('now') stores UTC as "YYYY-MM-DD HH:MM:SS" with no
 * timezone marker. JS parses that as local time, so append 'Z' to keep it UTC.
 */
function parseStoredDate(iso: string): Date {
  return new Date(iso.replace(' ', 'T') + 'Z');
}

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}

/** e.g. "19 Aug 2026, 21:05" */
export function formatDateTime(iso: string): string {
  const d = parseStoredDate(iso);
  const date = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
}

/** e.g. "19 Aug 2026" */
export function formatDate(iso: string): string {
  return parseStoredDate(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** True when `iso` (a stored UTC timestamp) falls on the device's current day. */
export function isToday(iso: string): boolean {
  const d = parseStoredDate(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function formatTime(iso: string): string {
  return parseStoredDate(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}