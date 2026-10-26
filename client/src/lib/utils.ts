import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Indian Paise into Rupees display string
 * e.g. 199900 -> "₹1,999"
 */
export function formatINR(paise: number = 0): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(
  pricePaise: number,
  compareAtPricePaise?: number
): number {
  if (!compareAtPricePaise || compareAtPricePaise <= pricePaise) {
    return 0;
  }
  const discount = ((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100;
  return Math.round(discount);
}

/**
 * Format ISO date string into readable Indian format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

/**
 * Retrieve or generate persistent guest session ID
 */
export function getGuestSessionId(): string {
  const KEY = 'lumora_guest_session_id';
  let sessionId = localStorage.getItem(KEY);
  if (!sessionId) {
    sessionId = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(KEY, sessionId);
  }
  return sessionId;
}
