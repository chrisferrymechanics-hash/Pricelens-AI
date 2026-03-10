import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This is a scheduled/admin function — use service role
    const watchlistItems = await base44.asServiceRole.entities.WatchlistItem.list();

    if (!watchlistItems || watchlistItems.length === 0) {
      return Response.json({ message: 'No watchlist items to check.' });
    }

    const results = [];

    for (const item of watchlistItems) {
      try {
        // Re-evaluate the item's current market value using LLM + internet
        const searchTerm = item.search_query || item.item_name;
        const prompt = `You are a market pricing expert. Search the internet right now for the current resale market value of: "${searchTerm}".

${item.item_description ? `Item description: ${item.item_description}` : ''}
${item.category ? `Category: ${item.category}` : ''}

Find the current secondhand/used market price range from eBay sold listings, Mercari, Facebook Marketplace and similar platforms.
Return ONLY the price range as two numbers. Be conservative and accurate. Use USD.`;

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              value_low: { type: "number", description: "Low end of current market value in USD" },
              value_high: { type: "number", description: "High end of current market value in USD" },
              confidence: { type: "string", enum: ["low", "medium", "high"] },
              notes: { type: "string" }
            }
          }
        });

        const newLow = response.value_low;
        const newHigh = response.value_high;
        const oldLow = item.last_known_value_low;
        const oldHigh = item.last_known_value_high;

        // Calculate % change based on midpoint
        const oldMid = oldLow && oldHigh ? (oldLow + oldHigh) / 2 : null;
        const newMid = newLow && newHigh ? (newLow + newHigh) / 2 : null;
        const lastAlertMid = item.last_alert_value_low && item.last_known_value_high
          ? (item.last_alert_value_low + (item.last_known_value_high || 0)) / 2
          : oldMid;

        const threshold = (item.alert_threshold ?? 10) / 100;
        const shouldAlert = oldMid && newMid && lastAlertMid && (
          Math.abs(newMid - lastAlertMid) / lastAlertMid >= threshold
        );

        // Update the watchlist record
        await base44.asServiceRole.entities.WatchlistItem.update(item.id, {
          last_known_value_low: newLow || oldLow,
          last_known_value_high: newHigh || oldHigh,
          last_checked: new Date().toISOString(),
          ...(shouldAlert ? { last_alert_value_low: newLow } : {})
        });

        if (shouldAlert && item.user_email) {
          const direction = newMid > lastAlertMid ? '📈 increased' : '📉 decreased';
          const pctChange = Math.abs(((newMid - lastAlertMid) / lastAlertMid) * 100).toFixed(0);

          const emailBody = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #22d3ee; margin: 0; font-size: 22px;">💰 Price Alert</h1>
    <p style="color: #94a3b8; margin: 4px 0 0;">Price Scout Watchlist Update</p>
  </div>

  <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
    <h2 style="margin: 0 0 8px; font-size: 16px; color: #f1f5f9;">${item.item_name}</h2>
    <p style="color: #94a3b8; margin: 0; font-size: 14px;">Market value has <strong style="color: ${newMid > lastAlertMid ? '#34d399' : '#f87171'}">${direction} by ~${pctChange}%</strong></p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
    <tr>
      <td style="padding: 12px; background: #1e293b; border-radius: 8px 0 0 8px; text-align: center;">
        <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Previous Value</div>
        <div style="color: #f1f5f9; font-size: 18px; font-weight: bold;">$${oldLow?.toFixed(0) || '?'} – $${oldHigh?.toFixed(0) || '?'}</div>
      </td>
      <td style="padding: 12px; background: #1e293b; border-radius: 0 8px 8px 0; text-align: center; border-left: 2px solid #0f172a;">
        <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Current Value</div>
        <div style="color: ${newMid > lastAlertMid ? '#34d399' : '#f87171'}; font-size: 18px; font-weight: bold;">$${newLow?.toFixed(0) || '?'} – $${newHigh?.toFixed(0) || '?'}</div>
      </td>
    </tr>
  </table>

  ${response.notes ? `<p style="color: #94a3b8; font-size: 13px; background: #1e293b; padding: 12px; border-radius: 8px;">${response.notes}</p>` : ''}

  <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 24px;">
    Price Scout Watchlist • AI-powered price monitoring<br/>
    Prices are estimates based on current market data.
  </p>
</div>`;

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: item.user_email,
            subject: `Price Alert: ${item.item_name} value ${direction} ${pctChange}%`,
            body: emailBody
          });

          results.push({ item: item.item_name, alerted: true, change: `${pctChange}%`, direction });
          console.log(`Alert sent for: ${item.item_name} (${pctChange}% change)`);
        } else {
          results.push({ item: item.item_name, alerted: false, newLow, newHigh });
          console.log(`No significant change for: ${item.item_name}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 1000));

      } catch (itemErr) {
        console.error(`Error processing watchlist item ${item.item_name}:`, itemErr.message);
        results.push({ item: item.item_name, error: itemErr.message });
      }
    }

    return Response.json({
      message: `Checked ${watchlistItems.length} watchlist items`,
      results
    });

  } catch (error) {
    console.error('checkWatchlistPrices error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});