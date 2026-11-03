// Response schemas for the app's AI evaluations.
// Required fields force the model to answer every essential question instead of
// returning a partial object that breaks the results UI.

export const APPRAISAL_SCHEMA = {
  type: 'object',
  required: [
    'item_name',
    'item_description',
    'condition_estimate',
    'condition_score',
    'buy_recommendations',
    'sell_recommendations',
  ],
  properties: {
    item_name: { type: 'string', description: 'Brand + model + variant. Never empty.' },
    item_description: { type: 'string', description: 'One or two sentences describing the exact item.' },
    category: { type: 'string' },
    condition_estimate: { type: 'string', enum: ['new', 'like_new', 'good', 'fair', 'poor'] },
    condition_score: { type: 'number', minimum: 1, maximum: 10 },
    condition_details: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        defects_found: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              severity: { type: 'string', enum: ['minor', 'moderate', 'severe'] },
              location: { type: 'string' },
              price_impact: { type: 'string' },
            },
          },
        },
        wear_level: { type: 'string' },
        functionality_assessment: { type: 'string' },
        cosmetic_rating: { type: 'number', minimum: 1, maximum: 10 },
        completeness: { type: 'string' },
      },
    },
    new_price_low: { type: ['number', 'null'], description: 'USD, null when the item is not sold new.' },
    new_price_high: { type: ['number', 'null'] },
    secondhand_price_low: { type: ['number', 'null'], description: 'USD, null when unverified.' },
    secondhand_price_high: { type: ['number', 'null'] },
    auction_price_low: { type: ['number', 'null'] },
    auction_price_high: { type: ['number', 'null'] },
    buy_recommendations: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          platform: { type: 'string' },
          price_range: { type: 'string' },
          url: { type: ['string', 'null'], description: 'Only a URL you actually saw; otherwise null.' },
          is_local: { type: 'boolean' },
        },
      },
    },
    sell_recommendations: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          platform: { type: 'string' },
          expected_price: { type: 'string' },
          fees: { type: 'string' },
          time_to_sell: { type: 'string' },
          url: { type: ['string', 'null'] },
          is_local: { type: 'boolean' },
        },
      },
    },
  },
};

export const COLLECTIBLE_SCHEMA = {
  type: 'object',
  required: [
    'item_name',
    'item_description',
    'collectible_type',
    'condition_score',
    'rarity',
    'grading_estimates',
    'estimated_value_low',
    'estimated_value_high',
  ],
  properties: {
    item_name: { type: 'string' },
    item_description: { type: 'string' },
    collectible_type: { type: 'string', enum: ['coin', 'stamp', 'comic', 'trading_card', 'antique', 'memorabilia', 'other'] },
    condition_score: { type: 'number', minimum: 1, maximum: 10 },
    condition_details: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        defects_found: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              severity: { type: 'string', enum: ['minor', 'moderate', 'severe'] },
              location: { type: 'string' },
              price_impact: { type: 'string' },
            },
          },
        },
        centering: { type: 'string' },
        corners: { type: 'string' },
        edges: { type: 'string' },
        surface: { type: 'string' },
        overall_preservation: { type: 'string' },
      },
    },
    serial_number: { type: 'string' },
    mint_mark: { type: 'string' },
    artist_signature: { type: 'string' },
    year: { type: 'string' },
    edition: { type: 'string' },
    rarity: { type: 'string', enum: ['common', 'uncommon', 'rare', 'very_rare', 'extremely_rare', 'legendary'] },
    rarity_score: { type: 'number', minimum: 1, maximum: 10 },
    key_identifiers: { type: 'array', items: { type: 'string' } },
    authenticity: {
      type: 'object',
      properties: {
        confidence: { type: 'number', minimum: 0, maximum: 100, description: 'Only high when clear physical evidence is visible.' },
        notes: { type: 'string' },
      },
    },
    grading_estimates: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          service: { type: 'string' },
          scale: { type: 'string', description: 'e.g. "PSA 1-10", "PCGS 1-70".' },
          estimated_grade: { type: 'string' },
          numeric_grade: { type: ['number', 'null'], description: "Must use that service's own scale; never above its maximum." },
          subgrades: { type: 'object' },
          notes: { type: 'string' },
        },
      },
    },
    grading_service: { type: 'string' },
    grading_recommendation: { type: 'string' },
    historical_sales: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'ISO date (YYYY-MM-DD) of the sale you actually saw.' },
          price: { type: ['number', 'null'] },
          grade: { type: 'string' },
          grading_service: { type: 'string' },
          platform: { type: 'string' },
          url: { type: ['string', 'null'] },
        },
      },
    },
    estimated_value_low: { type: ['number', 'null'] },
    estimated_value_high: { type: ['number', 'null'] },
    graded_value_low: { type: ['number', 'null'] },
    graded_value_high: { type: ['number', 'null'] },
    value_by_grade: { type: 'object' },
    trading_platforms: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price_range: { type: 'string' },
          url: { type: ['string', 'null'] },
          notes: { type: 'string' },
          is_specialized: { type: 'boolean' },
          is_local: { type: 'boolean' },
        },
      },
    },
  },
};