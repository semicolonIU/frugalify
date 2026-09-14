'use client';

// Utility helper functions used across the app

/**
 * Format number to Indonesian Rupiah format
 * e.g. 1500000 => "Rp 1.500.000"
 */
export function formatRupiah(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
    }
    if (amount >= 1_000) {
      return `Rp ${(amount / 1_000).toFixed(0)}rb`;
    }
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a raw number or numeric string with Indonesian thousand separator dots for inputs
 * e.g. 1500000 -> "1.500.000"
 */
export function formatNumberInput(val: number | string): string {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('id-ID');
}

/**
 * Parses a formatted string back to raw number
 * e.g. "1.500.000" -> 1500000
 */
export function parseNumberInput(val: string): number {
  const cleanStr = String(val).replace(/\D/g, '');
  return cleanStr ? Number(cleanStr) : 0;
}

/**
 * Format date string from YYYY-MM-DD to Indonesian locale
 * e.g. "2026-08-07" => "7 Agustus 2026"
 */
export function formatDateID(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Returns relative time string in Indonesian
 * e.g. "2 hari yang lalu", "hari ini"
 */
export function relativeTimeID(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return formatDateID(dateStr);
  } catch {
    return dateStr;
  }
}

/**
 * Classnames utility (simple cx)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generates unique ID string
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}
