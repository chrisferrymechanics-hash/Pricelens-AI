// Normalizers: turn whatever the model returned into records that always render.
// Every numeric pair is validated, every link is checked, and missing values
// become explicit nulls instead of crashing the results screens.

import {
  asArray,
  clamp,
  cleanText,
  conditionFromScore,
  dedupeBy,
  normalizeRange,
  positiveNumber,
  safeUrl,
  CONDITION_LEVELS,
} from '@/lib/ai/grounding';

// A link must lead to the item or a listing page — a bare marketplace homepage is a dead end.
const listingUrl = (value) => {
  const url = safeUrl(value);
  if (!url) return null;
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '');
    return path === '' ? null : url;
  } catch {
    return null;
  }
};

// Price strings render beside numeric cards, so they must read as currency.
const priceText = (value) => {
  const text = cleanText(value, '');
  if (!text || text.includes('$') || !/\d/.test(text)) return text;
  return text.replace(/(\d[\d,]*(?:\.\d+)?)/g, (match) => `$${match}`);
};

const cleanDefects = (value) =>
  asArray(value)
    .map((defect) => ({
      type: cleanText(defect?.type, 'Issue'),
      severity: ['minor', 'moderate', 'severe'].includes(defect?.severity) ? defect.severity : 'minor',
      location: cleanText(defect?.location, ''),
      price_impact: cleanText(defect?.price_impact, ''),
    }))
    .slice(0, 12);

const cleanBuyRecs = (value) =>
  dedupeBy(asArray(value), (rec) => cleanText(rec?.platform)?.toLowerCase())
    .map((rec) => ({
      platform: cleanText(rec?.platform, 'Marketplace'),
      price_range: priceText(rec?.price_range),
      url: listingUrl(rec?.url),
      is_local: Boolean(rec?.is_local),
    }))
    .slice(0, 5);

const cleanSellRecs = (value) =>
  dedupeBy(asArray(value), (rec) => cleanText(rec?.platform)?.toLowerCase())
    .map((rec) => ({
      platform: cleanText(rec?.platform, 'Marketplace'),
      expected_price: priceText(rec?.expected_price),
      fees: cleanText(rec?.fees, ''),
      time_to_sell: cleanText(rec?.time_to_sell, ''),
      url: listingUrl(rec?.url),
      is_local: Boolean(rec?.is_local),
    }))
    .slice(0, 5);

export function normalizeAppraisal(raw) {
  const data = raw || {};
  const score = Math.round(clamp(data.condition_score, 1, 10) ?? 5);
  const [newLow, newHigh] = normalizeRange(data.new_price_low, data.new_price_high);
  const [usedLow, usedHigh] = normalizeRange(data.secondhand_price_low, data.secondhand_price_high);
  const [auctionLow, auctionHigh] = normalizeRange(data.auction_price_low, data.auction_price_high);

  return {
    ...data,
    item_name: cleanText(data.item_name, 'Unidentified item'),
    item_description: cleanText(data.item_description, 'No description available.'),
    condition_score: score,
    condition_estimate: CONDITION_LEVELS.includes(data.condition_estimate)
      ? data.condition_estimate
      : conditionFromScore(score),
    condition_details: {
      summary: cleanText(data.condition_details?.summary, ''),
      defects_found: cleanDefects(data.condition_details?.defects_found),
      wear_level: cleanText(data.condition_details?.wear_level, ''),
      functionality_assessment: cleanText(data.condition_details?.functionality_assessment, ''),
      cosmetic_rating: clamp(data.condition_details?.cosmetic_rating, 1, 10),
      completeness: cleanText(data.condition_details?.completeness, ''),
    },
    new_price_low: newLow,
    new_price_high: newHigh,
    secondhand_price_low: usedLow,
    secondhand_price_high: usedHigh,
    auction_price_low: auctionLow,
    auction_price_high: auctionHigh,
    buy_recommendations: cleanBuyRecs(data.buy_recommendations),
    sell_recommendations: cleanSellRecs(data.sell_recommendations),
    currency: 'USD',
  };
}

const SCALE_MAX = { PSA: 10, BGS: 10, SGC: 10, CGC: 10, CSG: 10, PCGS: 70, NGC: 70, ANACS: 70, ICG: 70, CBCS: 10, PSE: 100 };

function cleanGradingEstimates(value) {
  return asArray(value)
    .map((estimate) => {
      const service = cleanText(estimate?.service, 'Grading service');
      const key = Object.keys(SCALE_MAX).find((name) => service.toUpperCase().includes(name));
      const max = key ? SCALE_MAX[key] : 100;
      return {
        service,
        scale: cleanText(estimate?.scale, ''),
        estimated_grade: cleanText(estimate?.estimated_grade, ''),
        numeric_grade: clamp(estimate?.numeric_grade, 0, max),
        subgrades: estimate?.subgrades && typeof estimate.subgrades === 'object' ? estimate.subgrades : {},
        notes: cleanText(estimate?.notes, ''),
      };
    })
    .slice(0, 6);
}

function cleanHistoricalSales(value) {
  return dedupeBy(
    asArray(value).map((sale) => ({
      date: cleanText(sale?.date, ''),
      price: positiveNumber(sale?.price),
      grade: cleanText(sale?.grade, ''),
      grading_service: cleanText(sale?.grading_service, ''),
      platform: cleanText(sale?.platform, ''),
      url: listingUrl(sale?.url),
    })),
    (sale) => `${sale.date}|${sale.price}|${sale.platform}`
  )
    .filter((sale) => sale.price != null)
    .slice(0, 10);
}

export function normalizeCollectible(raw) {
  const data = raw || {};
  const score = Math.round(clamp(data.condition_score, 1, 10) ?? 5);
  const [valueLow, valueHigh] = normalizeRange(data.estimated_value_low, data.estimated_value_high);
  const [gradedLow, gradedHigh] = normalizeRange(data.graded_value_low, data.graded_value_high);

  return {
    ...data,
    item_name: cleanText(data.item_name, 'Unidentified collectible'),
    item_description: cleanText(data.item_description, 'No description available.'),
    collectible_type: data.collectible_type || 'other',
    condition_score: score,
    rarity: data.rarity || 'common',
    rarity_score: clamp(data.rarity_score, 1, 10),
    condition_details: {
      ...(data.condition_details || {}),
      summary: cleanText(data.condition_details?.summary, ''),
      defects_found: cleanDefects(data.condition_details?.defects_found),
    },
    key_identifiers: asArray(data.key_identifiers).filter((id) => typeof id === 'string' && id.trim()).slice(0, 10),
    authenticity: {
      confidence: clamp(data.authenticity?.confidence, 0, 100) ?? 0,
      notes: cleanText(data.authenticity?.notes, ''),
    },
    grading_estimates: cleanGradingEstimates(data.grading_estimates),
    historical_sales: cleanHistoricalSales(data.historical_sales),
    estimated_value_low: valueLow,
    estimated_value_high: valueHigh,
    graded_value_low: gradedLow,
    graded_value_high: gradedHigh,
    trading_platforms: dedupeBy(asArray(data.trading_platforms), (p) => cleanText(p?.name)?.toLowerCase())
      .map((platform) => ({
        name: cleanText(platform?.name, 'Platform'),
        price_range: priceText(platform?.price_range),
        url: safeUrl(platform?.url),
        notes: cleanText(platform?.notes, ''),
        is_specialized: Boolean(platform?.is_specialized),
        is_local: Boolean(platform?.is_local),
      }))
      .slice(0, 5),
    currency: 'USD',
  };
}

export function normalizeQuickIdentify(raw) {
  const data = raw || {};
  const [low, high] = normalizeRange(data.estimated_value_low, data.estimated_value_high);
  return {
    item_name: cleanText(data.item_name, 'Unidentified item'),
    category: cleanText(data.category, ''),
    estimated_value_low: low,
    estimated_value_high: high,
  };
}

export function normalizeSimilarItems(raw) {
  return dedupeBy(asArray(raw?.similar_items), (item) => cleanText(item?.name)?.toLowerCase())
    .map((item) => {
      const [newLow, newHigh] = normalizeRange(item?.new_price_low, item?.new_price_high);
      const [usedLow, usedHigh] = normalizeRange(item?.used_price_low, item?.used_price_high);
      return {
        name: cleanText(item?.name, 'Comparable item'),
        reason: cleanText(item?.reason, ''),
        new_price_low: newLow,
        new_price_high: newHigh,
        used_price_low: usedLow,
        used_price_high: usedHigh,
        price_difference: cleanText(item?.price_difference, ''),
      };
    })
    .slice(0, 5);
}

export function normalizeBulkResult(raw) {
  const data = raw || {};
  const score = Math.round(clamp(data.condition_score, 1, 10) ?? 5);
  const [usedLow, usedHigh] = normalizeRange(data.secondhand_price_low, data.secondhand_price_high);
  const [valueLow, valueHigh] = normalizeRange(data.estimated_value_low, data.estimated_value_high);
  return {
    ...data,
    item_name: cleanText(data.item_name, 'Unidentified item'),
    category: cleanText(data.category, ''),
    condition_score: score,
    condition_estimate: CONDITION_LEVELS.includes(data.condition_estimate)
      ? data.condition_estimate
      : conditionFromScore(score),
    secondhand_price_low: usedLow,
    secondhand_price_high: usedHigh,
    estimated_value_low: valueLow,
    estimated_value_high: valueHigh,
    resale_potential: ['high', 'medium', 'low'].includes(data.resale_potential) ? data.resale_potential : 'medium',
    resale_reason: cleanText(data.resale_reason, ''),
    quick_sell_tip: cleanText(data.quick_sell_tip, ''),
  };
}