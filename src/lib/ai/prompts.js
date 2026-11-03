// Prompt builders for every AI evaluation flow.
// Each prompt carries the same grounding contract so answers are consistent,
// verifiable and never fabricated.

export const GROUNDING_RULES = `
GROUNDING CONTRACT — follow every rule, without exception:
1. Every price must come from live data retrieved during this task. If a figure cannot be verified, return null for that numeric field. Never fill a number from memory or by guessing.
2. Never invent a URL, listing, sale, population figure or grading record. Only include a link you actually saw in your results; otherwise return null.
3. Numeric fields hold plain USD numbers only — no currency symbols, no words, no ranges. In every low/high pair, low must be less than or equal to high.
4. Prefer evidence from the last 90 days and always report in USD.
5. Do not invent defects, damage or accessories you cannot see. When condition is uncertain, score conservatively and say why in the summary.
6. Your numbers and your written analysis must agree. If you are unsure, widen the range instead of contradicting yourself.
7. Fill every required field. Never return an empty object or null for the whole response.
8. Distinguish what you observed from what you inferred: state inference as inference.`;

const LOCAL_CONTEXT = (userLocation) =>
  userLocation
    ? `The buyer is near coordinates (${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}). Prefer genuinely local shops and marketplaces serving that area first, then national/online options, and mark each with is_local.`
    : 'Include both online and local marketplace options and mark each with is_local.';

export function buildAppraisalPrompt({ userLocation } = {}) {
  return `You are a senior appraiser and resale market analyst. Analyse the attached image and produce a defensible valuation.

STEP 1 — IDENTIFICATION
Identify the exact item: brand, model, variant, generation, and year if visible. Use the most specific identification the image supports. If two items are plausible, name the more likely one and mention the alternative in item_description.

STEP 2 — CONDITION ASSESSMENT
Examine only what is visible: scratches, scuffs, dents, cracks, discoloration, stains, fading, worn edges, loose parts, missing accessories, signs of repair or modification, overall cleanliness.
Score condition 1-10 (10 = mint, 7 = good used, 5 = fair, 3 = poor but functional, 1 = heavily damaged). List each defect with type, severity, location and price impact. If the photo angle hides an area, say so rather than assuming it is perfect.

STEP 3 — MARKET PRICES (retrieve live prices)
Adjust every price downward for the defects you observed.
- New retail: current price from major retailers. If the item is discontinued or no longer sold new, return null.
- Secondhand: eBay sold listings, Mercari, Facebook Marketplace for this exact item in comparable condition.
- Auction: recent eBay auction results or estate sales.
Never quote a price you could not verify in the search results.

STEP 4 — BUY AND SELL GUIDANCE
Top 5 places to BUY with current price ranges and links; top 5 places to SELL with condition-adjusted expected price, seller fees, typical days to sell and links.
${LOCAL_CONTEXT(userLocation)}
${GROUNDING_RULES}`;
}

export function buildKeywordPrompt({ query, userLocation } = {}) {
  return `You are a price researcher and resale market analyst. Produce a data-driven pricing report for: "${query}".

STEP 1 — IDENTIFICATION
Resolve the query to an exact product: full brand, model, variant, year/generation. If the query is ambiguous, research the most commonly traded version and name the assumption inside item_description.

STEP 2 — MARKET PRICES (retrieve live prices)
- New retail: current shelf price at major retailers or the manufacturer.
- Secondhand: current eBay sold comps, Mercari, Facebook Marketplace for this exact model in realistic used condition.
- Auction: recent auction results for the same model and condition.
If a segment has no verifiable data (for example a discontinued item with no new stock), return null for that segment instead of a placeholder.

STEP 3 — BUY RECOMMENDATIONS (up to 5)
Platform, current price range, direct link. ${LOCAL_CONTEXT(userLocation)}

STEP 4 — SELL RECOMMENDATIONS (up to 5)
Platform, realistic expected sale price, seller fees, typical days to sell, direct link.
${GROUNDING_RULES}`;
}

export function buildCollectiblePrompt({ imageCount = 1 } = {}) {
  return `You are a professional collectibles appraiser fluent in every major grading service. Analyse these ${imageCount} image${imageCount > 1 ? 's' : ''} and return a defensible appraisal.

STEP 1 — MULTI-ANGLE CONDITION ANALYSIS
Work through all angles provided. Record serial numbers, certification codes, mint marks, signatures, existing grade labels or authentication marks actually readable in the images.
Assess centering, corners, edges, surface, structural integrity, colour vibrancy, gloss and any restoration or alteration. Document every visible defect with location and severity. If an important area is not visible, state that explicitly.

STEP 2 — IDENTIFICATION
Exact title, collectible type (coin, stamp, comic, trading_card, antique, memorabilia, other), manufacturer/publisher/mint, year, edition/series/variant, and distinguishing features or known errors.

STEP 3 — CONDITION SCORE (1-10)
10 Gem Mint, 9 Mint, 8 Near Mint-Mint, 7 Near Mint, 6 Excellent-Mint, 5 Excellent, 4 Very Good-Excellent, 3-1 Good to Poor.

STEP 4 — RELEVANT GRADING SERVICES
Trading cards: PSA, BGS, SGC, CGC Cards. Coins: PCGS, NGC, ANACS, ICG. Comics: CGC, CBCS. Stamps: PSE, APS. Autographs: PSA/DNA, JSA, BAS.

STEP 5 — GRADING ESTIMATES
For each applicable service give the service, its scale, the estimated grade, the numeric grade on that service's own scale (never above that scale's maximum — PSA/BGS/SGC/CGC cards 1-10, PCGS/NGC 1-70), subgrades where the service uses them (BGS centering, corners, edges, surface), and notes tying the grade to the defects observed. Keep grades consistent across services: a PSA 8-quality card is roughly a BGS 8.5-9, not a BGS 10.

STEP 6 — MARKET RESEARCH (retrieve live data)
Check PSA CardFacts, BGS population, PCGS CoinFacts, NGC Census, CGC Census, Heritage Auctions, eBay sold, COMC and PWCC. Report only sales you actually found, with dates in YYYY-MM-DD format, and at most 10 of the closest comps. Population figures only when you saw them.

STEP 7 — VALUATION
Ungraded range based on the condition assessment, graded range for the expected grade, value by key grade levels, and the price impact of each defect you listed. When the market is thin, widen the range and say so.

STEP 8 — AUTHENTICITY AND RARITY
Authenticity confidence 0-100 based on physical evidence only (do not exceed 90 without visible certification). Rarity with justification.

STEP 9 — SPECIALISED PLATFORMS
Up to 5 platforms suited to this collectible type with current prices and links.
${GROUNDING_RULES}`;
}

export function buildQuickIdentifyPrompt() {
  return `Identify the item in this image for a quick preview. No market research yet.

Return the most specific name you can support from the photo (brand + model + variant), a short category, and a rough USD value range for that item in the visible condition. If you cannot support a value range from the image alone, return null for both value fields rather than guessing.
${GROUNDING_RULES}`;
}