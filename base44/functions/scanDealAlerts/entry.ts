import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // For scheduled calls there's no user — use service role
    const allSubscriptions = await base44.asServiceRole.entities.Subscription.filter({ is_active: true });

    if (!allSubscriptions.length) {
      return Response.json({ message: 'No active subscriptions', processed: 0 });
    }

    let alertsSent = 0;

    for (const sub of allSubscriptions) {
      // Search the internet for underpriced listings
      const prompt = `You are a deal-hunting expert scanning resale marketplaces for underpriced bargains. Search eBay, Facebook Marketplace, Craigslist, Mercari, OfferUp, and Gumtree RIGHT NOW for active listings of "${sub.keyword}"${sub.max_price ? ` priced under $${sub.max_price}` : ''}.

CRITERIA FOR A GOOD DEAL:
- Listed price is at least 20% below average market value for comparable items in similar condition
- Item appears genuine and listing looks legitimate
- Seller has reasonable feedback or verifiable listing details

For each qualifying deal found, return:
- Listing title (exact)
- Listed price
- Estimated fair market value for that condition
- % below market value
- Direct URL to the listing
- Platform/marketplace name
- Concise reason why this is a strong deal (mention condition, price gap, seller urgency if visible)

Be selective — only include deals where the profit opportunity is clear and real. If genuinely no deals found, return an empty deals array rather than making up listings.`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            deals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  price: { type: "number" },
                  market_value: { type: "number" },
                  discount_percent: { type: "number" },
                  url: { type: "string" },
                  platform: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      const deals = result?.deals || [];

      if (deals.length > 0) {
        // Build the email
        const dealsHtml = deals.map(deal => `
          <div style="margin-bottom:20px; padding:16px; background:#f8f9fa; border-left:4px solid #10b981; border-radius:4px;">
            <h3 style="margin:0 0 8px; color:#111;">${deal.title}</h3>
            <p style="margin:0 0 6px;">
              <strong style="color:#10b981; font-size:18px;">$${deal.price}</strong>
              <span style="color:#888; text-decoration:line-through; margin-left:8px;">Market: $${deal.market_value}</span>
              <span style="color:#10b981; margin-left:8px; font-weight:bold;">${deal.discount_percent}% below market</span>
            </p>
            <p style="margin:0 0 10px; color:#555; font-size:14px;">${deal.reason}</p>
            <a href="${deal.url}" style="display:inline-block; padding:8px 16px; background:#10b981; color:white; text-decoration:none; border-radius:6px; font-size:14px;">
              View on ${deal.platform} →
            </a>
          </div>
        `).join('');

        const emailBody = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; color:#333;">
  <div style="text-align:center; margin-bottom:24px;">
    <h1 style="color:#0ea5e9; margin:0;">🔔 Deal Alert: ${sub.keyword}</h1>
    <p style="color:#888;">We found ${deals.length} underpriced listing${deals.length > 1 ? 's' : ''} matching your watch</p>
  </div>

  ${dealsHtml}

  <hr style="margin:24px 0; border:none; border-top:1px solid #eee;" />
  <p style="color:#aaa; font-size:12px; text-align:center;">
    You're receiving this because you set up a keyword alert for "<strong>${sub.keyword}</strong>" in Price Scout.<br/>
    To stop these alerts, open the app and disable or delete this subscription.
  </p>
</body>
</html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sub.user_email,
          subject: `🔔 Deal Alert: ${deals.length} underpriced ${sub.keyword} listing${deals.length > 1 ? 's' : ''} found!`,
          body: emailBody
        });

        // Update alert count and last_checked
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          alert_count: (sub.alert_count || 0) + deals.length,
          last_checked: new Date().toISOString()
        });

        alertsSent += deals.length;
      } else {
        // Still update last_checked even if no deals found
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          last_checked: new Date().toISOString()
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }

    return Response.json({
      message: 'Scan complete',
      subscriptions_checked: allSubscriptions.length,
      alerts_sent: alertsSent
    });

  } catch (error) {
    console.error('scanDealAlerts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});