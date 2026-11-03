// Shared helpers that make AI output safe to render and store.

export function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function positiveNumber(value) {
  const n = toNumber(value);
  return n != null && n > 0 ? Math.round(n * 100) / 100 : null;
}

export function clamp(value, min, max) {
  const n = toNumber(value);
  if (n == null) return null;
  return Math.min(max, Math.max(min, n));
}

// Guarantees a valid low/high pair: no inverted ranges, no zero negatives.
export function normalizeRange(low, high) {
  let lo = positiveNumber(low);
  let hi = positiveNumber(high);
  if (lo == null && hi == null) return [null, null];
  if (lo == null) lo = hi;
  if (hi == null) hi = lo;
  return lo <= hi ? [lo, hi] : [hi, lo];
}

export function safeUrl(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function dedupeBy(list, keyFn) {
  const seen = new Set();
  return asArray(list).filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function cleanText(value, fallback = null) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed : fallback;
}

export const CONDITION_LEVELS = ['new', 'like_new', 'good', 'fair', 'poor'];

export function conditionFromScore(score) {
  if (score == null) return 'good';
  if (score >= 9) return 'new';
  if (score >= 7) return 'like_new';
  if (score >= 5) return 'good';
  if (score >= 3) return 'fair';
  return 'poor';
}