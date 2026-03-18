import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * scanMarketplaceBuys
 *
 * For every active WatchlistItem that has a known value range, we ask the LLM
 * (with live internet search) to find real marketplace listings priced
 * significantly below the historical average, then store each deal as a
 * BuyOpportunity record and optionally send an email alert.
 *
 * Runs on a schedule (e.g. every 12 hours).
 * Can also be triggered manually via the Base44 SDK.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (service-role) and manual (admin-user) invocation
    let callerIsAdmin = false;
    try {
      const user = await base44.auth.me();
      callerIsAdmin = user?.role === 'admin';
    } catch (_) {
      // scheduled / unauthenticated call – proceed via service role only
    }

    const sr = base44.asServiceRole;

    // ── 1. Fetch all watchlist items that have a price baseline ──────────────
    const allItems = await sr.entities.WatchlistItem.list('-created_date', 200);
    const eligible = allItems.filter(
      (i) => i.last_known_value_low && i.last_known_value_high
    );

    if (eligible.length === 0) {
      return Response.json({ message: 'No eligible watchlist items found.', scanned: 0 });
    }

    // ── 2. Purge old non-dismissed opportunities (keep feed fresh) ────────────
    const allOpps = await sr.entities.BuyOpportunity.list('-created_date', 500);
    const cutoff = Date.now() - 48 * 60 * 60 * 1000; // 48 h
    const existingUrls = new Set();
    for (const opp of allOpps) {
      const isStale = new Date(opp.scanned_at || opp.created_date).getTime() < cutoff;
      if (isStale) {
        // Delete all stale records regardless of dismissed state
        await sr.entities.BuyOpportunity.delete(opp.id);
      } else {
        // Only track URLs of non-stale records to avoid blocking future deduplication
        if (opp.listing_url) existingUrls.add(opp.listing_url);
      }
    }

    const results = { scanned: 0, deals_found: 0, errors: [] };

    // ── 3. For each item, search for underpriced listings via LLM + web ───────
    for (const item of eligible) {
      try {
        const historicalAvg = (item.last_known_value_low + item.last_known_value_high) / 2;
        const threshold = (item.alert_threshold ?? 10); // reuse same threshold % as price alerts

        const prompt = `
You are a marketplace price analyst. Search popular marketplaces (eBay, Etsy, eBay sold listings, Craigslist, Facebook Marketplace, Depop, Poshmark, or any specialist collectibles site) for listings of the following item that are currently available to buy RIGHT NOW at a price significantly below its known market value.

Item: "${item.item_name}"
${item.item_description ? `Description: ${item.item_description}` : ''}
${item.search_query ? `Search keywords: ${item.search_query}` : ''}
${item.category ? `Category: ${item.category}` : ''}
${item.collectible_type ? `Collectible type: ${item.collectible_type}` : ''}
Known market value range: $${item.last_known_value_low.toFixed(2)} – $${item.last_known_value_high.toFixed(2)} USD (average ~$${historicalAvg.toFixed(2)})
Discount threshold: ${threshold}% below average = must be priced at or below $${(historicalAvg * (1 - threshold / 100)).toFixed(2)}

Search eBay active listings, eBay sold, Etsy, and any specialist platforms for this item. 
Return UP TO 3 real listings that meet the discount threshold. Only include listings with an ACTUAL URL you found.
If no qualifying listings exist, return an empty array.

Return ONLY valid JSON matching this schema:
{
  "listings": [
    {
      "platform": "string (e.g. eBay, Etsy)",
      "listing_title": "string",
      "listing_url": "string (real URL)",
      "listing_price": number
    }
  ]
}
`.trim();

        const response = await sr.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              listings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    platform: { type: 'string' },
                    listing_title: { type: 'string' },
                    listing_url: { type: 'string' },
                    listing_price: { type: 'number' },
                  },
                },
              },
            },
          },
        });

        results.scanned++;

        const listings = response?.listings ?? [];
        if (!Array.isArray(listings) || listings.length === 0) continue;

        // ── 4. Save qualifying listings as BuyOpportunity records ─────────────
        const newDeals = [];
        for (const listing of listings) {
          if (!listing.listing_price || listing.listing_price <= 0) continue;
          const discountPct = ((historicalAvg - listing.listing_price) / historicalAvg) * 100;
          if (discountPct < threshold) continue;

          if (!listing.listing_url || existingUrls.has(listing.listing_url)) continue;
          existingUrls.add(listing.listing_url);

          await sr.entities.BuyOpportunity.create({
            watchlist_item_id: item.id,
            item_name: item.item_name,
            image_url: item.image_url || null,
            user_email: item.user_email,
            platform: listing.platform,
            listing_title: listing.listing_title,
            listing_url: listing.listing_url,
            listing_price: listing.listing_price,
            historical_avg: historicalAvg,
            discount_pct: Math.round(discountPct * 10) / 10,
            is_dismissed: false,
            scanned_at: new Date().toISOString(),
          });

          newDeals.push({ ...listing, discountPct });
          results.deals_found++;
        }

        // ── 5. Send ONE grouped email per item if any new deals ──────────────
        if (newDeals.length > 0 && item.user_email) {
          const dealsHtml = newDeals.map(d => `
<b>Platform:</b> ${d.platform}<br/>
<b>Listing:</b> ${d.listing_title}<br/>
<b>Price:</b> $${d.listing_price.toFixed(2)} (${d.discountPct.toFixed(0)}% below market)<br/>
<a href="${d.listing_url}" target="_blank">View Listing →</a>
          `).join('<br/><hr/><br/>');

          await sr.integrations.Core.SendEmail({
            to: item.user_email,
            subject: `🛒 ${newDeals.length} buy opportunit${newDeals.length > 1 ? 'ies' : 'y'} found: ${item.item_name}`,
            body: `
<p>We found <strong>${newDeals.length}</strong> listing${newDeals.length > 1 ? 's' : ''} for <strong>${item.item_name}</strong> priced below its historical average of $${historicalAvg.toFixed(2)}.</p>
${dealsHtml}
<p style="color:#aaa;font-size:12px;">This alert was generated because you are watching this item on Priclens.</p>
            `.trim(),
          });
        }
      } catch (itemErr) {
        console.error(`Error scanning item "${item.item_name}":`, itemErr.message);
        results.errors.push({ item: item.item_name, error: itemErr.message });
      }
    }

    return Response.json({
      success: true,
      ...results,
    });
  } catch (err) {
    console.error('scanMarketplaceBuys fatal error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});