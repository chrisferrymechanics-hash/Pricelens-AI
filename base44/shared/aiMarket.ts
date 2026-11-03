// Shared AI helpers for the scheduled market scanners.
// Keeps every scanner on the same grounding contract, retries transient
// failures, and rejects fabricated prices or links before they reach a user.

export const MARKET_RULES = `
GROUNDING CONTRACT — follow every rule:
1. Every price must come from live data retrieved during this task. If a figure cannot be verified, omit that listing or return null. Never guess a number.
2. Never invent a listing, URL or sale. Only return a URL you actually saw in your results.
3. Numeric fields hold plain USD numbers only. In every low/high pair, low must be <= high.
4. Prefer listings and sales from the last 90 days.
5. Only report listings that are currently live and available, not old or expired ones.
6. Return an empty array rather than speculative or partially invented results.`;

const RETRY_NOTE = `RETRY — your previous answer was empty or invalid. Return one populated JSON object matching the schema. Omit anything you could not verify. Never invent prices or URLs.`;

export function toPrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function normalizeRange(low, high) {
  let lo = toPrice(low);
  let hi = toPrice(high);
  if (lo == null && hi == null) return [null, null];
  if (lo == null) lo = hi;
  if (hi == null) hi = lo;
  return lo <= hi ? [lo, hi] : [hi, lo];
}

const BLOCKED_HOSTS = ['example.com', 'example.org', 'example.net', 'localhost', 'test.com'];

export function isRealUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    if (BLOCKED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null;
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Structured AI call with one automatic retry and a strict validity check.
 * @param client - base44 client (or asServiceRole) exposing integrations.Core.InvokeLLM
 */
export async function invokeStructured(client, { prompt, schema, webSearch = true, attempts = 2 }) {
  let lastError = new Error('AI request failed');

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await client.integrations.Core.InvokeLLM({
        prompt: attempt === 1 ? prompt : `${prompt}\n\n${RETRY_NOTE}`,
        add_context_from_internet: webSearch,
        response_json_schema: schema,
      });

      if (result && typeof result === 'object' && Object.keys(result).length > 0) {
        return result;
      }
      lastError = new Error('Empty AI response');
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }

  throw lastError;
}