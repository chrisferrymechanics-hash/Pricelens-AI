import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, Search, ExternalLink, Wrench, DollarSign, Loader2, ChevronDown, ChevronUp, Package } from 'lucide-react';

export default function ResaleOpportunityFinder({ result }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const itemName = result?.item_name;
  const valueLow = result?.estimated_value_low || result?.secondhand_price_low || result?.new_price_low || 0;
  const valueHigh = result?.estimated_value_high || result?.secondhand_price_high || result?.new_price_high || 0;

  const findOpportunities = async () => {
    setLoading(true);
    try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert resale market analyst. Search the internet RIGHT NOW for "${itemName}" currently listed for sale.

MARKET CONTEXT: The estimated market value for this item is $${valueLow}–$${valueHigh}.

TASK 1 — UNDERPRICED DEALS (search eBay, Facebook Marketplace, Craigslist, Mercari, OfferUp, Gumtree, Poshmark):
Find 3–5 REAL, ACTIVE listings priced BELOW $${Math.round(valueLow * 0.85)} (at least 15% below the low estimate). For each:
- Platform name and listing notes/title snippet
- Listed price
- Estimated resale value based on current sold comps
- Net profit after platform fees (eBay ~13%, Mercari ~10%, Poshmark ~20%, FB Marketplace free)
- Direct URL to the listing

TASK 2 — FLIP PROFIT SUMMARY:
Calculate realistic averages across the deals found:
- Average buy price, average resale price, average net profit
- Best platform to resell on (considering fees, audience, speed)
- Typical days-to-sell for this item category

TASK 3 — VALUE-BOOSTING IMPROVEMENTS (5 suggestions):
List 5 specific, practical actions to increase resale value for "${itemName}". For each:
- Clear action title
- Why this increases value and by how much (e.g. "+$30–$50")
- Realistic cost estimate
- 1–3 exact products/supplies to buy: product name, direct Amazon/eBay URL, price range

Focus on improvements with the best ROI. Be specific — name actual products, not generic categories.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          underpriced_listings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                listed_price: { type: "number" },
                estimated_resale: { type: "number" },
                estimated_profit: { type: "number" },
                url: { type: "string" },
                notes: { type: "string" }
              }
            }
          },
          resale_summary: {
            type: "object",
            properties: {
              avg_buy_price: { type: "number" },
              avg_resale_price: { type: "number" },
              avg_net_profit: { type: "number" },
              best_platform_to_resell: { type: "string" },
              time_to_sell: { type: "string" }
            }
          },
          improvements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                value_increase: { type: "string" },
                cost_estimate: { type: "string" },
                supplies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      url: { type: "string" },
                      price_range: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    setData(response);
    setExpanded(true);
    } catch (err) {
      console.error('Resale opportunity finder error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (data) {
      setExpanded(!expanded);
    } else {
      findOpportunities();
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
      <button
        onClick={handleToggle}
        disabled={loading}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">Resale Opportunity Finder</div>
            <div className="text-xs text-slate-400">Find underpriced deals, flip tips & improvement supplies</div>
          </div>
        </div>
        {loading ? (
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin flex-shrink-0" />
        ) : data ? (
          expanded
            ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
            : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        ) : (
          <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        )}
      </button>

      {expanded && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-emerald-500/20 p-4 space-y-5"
        >
          {/* Resale Profit Summary */}
          {data.resale_summary && (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-slate-800/60 text-center">
                <div className="text-xs text-slate-500 mb-1">Buy For</div>
                <div className="text-base font-bold text-white">${data.resale_summary.avg_buy_price?.toFixed(0)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 text-center">
                <div className="text-xs text-slate-500 mb-1">Sell For</div>
                <div className="text-base font-bold text-white">${data.resale_summary.avg_resale_price?.toFixed(0)}</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                <div className="text-xs text-emerald-400 mb-1">Net Profit</div>
                <div className="text-base font-bold text-emerald-400">+${data.resale_summary.avg_net_profit?.toFixed(0)}</div>
              </div>
            </div>
          )}

          {data.resale_summary?.best_platform_to_resell && (
            <p className="text-xs text-slate-400 text-center -mt-2">
              Best to resell on: <span className="text-white font-medium">{data.resale_summary.best_platform_to_resell}</span>
              {data.resale_summary.time_to_sell && <> · Avg sell time: <span className="text-white">{data.resale_summary.time_to_sell}</span></>}
            </p>
          )}

          {/* Underpriced Listings */}
          {data.underpriced_listings?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Underpriced Deals Found
              </h4>
              <div className="space-y-2">
                {data.underpriced_listings.map((listing, i) => (
                  <a
                    key={i}
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-sm flex-shrink-0">
                      {listing.platform?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{listing.platform}</div>
                      {listing.notes && <div className="text-xs text-slate-400 truncate">{listing.notes}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-white">${listing.listed_price?.toFixed(0)}</div>
                      <div className="text-xs text-emerald-400">+${listing.estimated_profit?.toFixed(0)} profit</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Suggestions */}
          {data.improvements?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                Improvements to Boost Resale Value
              </h4>
              <div className="space-y-3">
                {data.improvements.map((imp, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium text-white text-sm">{imp.title}</div>
                      {imp.value_increase && (
                        <span className="text-xs text-emerald-400 whitespace-nowrap font-medium">+{imp.value_increase}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{imp.description}</p>
                    {imp.cost_estimate && (
                      <p className="text-xs text-slate-500 mb-2">Est. cost: {imp.cost_estimate}</p>
                    )}
                    {imp.supplies?.length > 0 && (
                      <div className="space-y-1">
                        {imp.supplies.map((supply, j) => (
                          <a
                            key={j}
                            href={supply.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded bg-slate-900/50 hover:bg-slate-900 transition-colors"
                          >
                            <Package className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                            <span className="text-xs text-slate-300 flex-1 truncate">{supply.name}</span>
                            {supply.price_range && <span className="text-xs text-slate-400 flex-shrink-0">{supply.price_range}</span>}
                            <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}