import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, DollarSign, FileText, Store, TrendingUp, Lightbulb, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function SellingAssistant({ result }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSellingAdvice = async () => {
    if (advice) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    setIsExpanded(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a top-tier marketplace consultant who has sold thousands of items. Your goal is to help this seller get the MAXIMUM price in the MINIMUM time.

      ITEM DETAILS:
      - Name: ${result.item_name}
      - Description: ${result.item_description}
      - Category: ${result.category || result.collectible_type || 'General'}
      - Condition Score: ${result.condition_score ? `${result.condition_score}/10` : 'Not assessed'}
      ${result.condition_details?.summary ? `- Condition Notes: ${result.condition_details.summary}` : ''}
      ${result.rarity ? `- Rarity: ${result.rarity}` : ''}
      ${result.year ? `- Year: ${result.year}` : ''}
      ${result.edition ? `- Edition: ${result.edition}` : ''}
      ${result.key_identifiers?.length ? `- Key Features: ${result.key_identifiers.slice(0, 3).join(', ')}` : ''}

      MARKET DATA:
      - New Price: $${result.new_price_low || result.estimated_value_low || '?'} – $${result.new_price_high || result.estimated_value_high || '?'}
      - Used Price: $${result.secondhand_price_low || result.estimated_value_low || '?'} – $${result.secondhand_price_high || result.estimated_value_high || '?'}
      ${result.auction_price_low ? `- Auction Range: $${result.auction_price_low} – $${result.auction_price_high}` : ''}
      ${result.historical_sales?.length ? `- Recent Sales Data: ${result.historical_sales.length} comparable sales on record` : ''}

      PLATFORM INTEL:
      ${result.sell_recommendations?.map(p => `- ${p.platform}: expected ${p.expected_price}, fees ${p.fees || 'unknown'}, time to sell ${p.time_to_sell || 'unknown'}`).join('\n') || 'Standard marketplaces available'}

      YOUR TASK — give precise, expert advice:

      1. PRICING STRATEGY
      - Exact recommended listing price (single number, not a range)  
      - Why that price (referencing actual market data above)
      - How much negotiation room to leave
      - When to drop the price and by how much if no offers

      2. LISTING OPTIMIZATION
      - SEO-optimised title (max 60 chars, include brand/model/year/condition keywords)
      - Compelling 2-paragraph description that converts browsers to buyers — mention the best features, condition highlights, and a subtle urgency trigger
      - 5 specific features/keywords to highlight
      - 4 must-have photo angles/shots for maximum click-through

      3. PLATFORM SELECTION
      - Single best platform recommendation with clear reason (audience, fees, speed for this category)
      - 3 platform-specific tips to optimise the listing there
      - 2 backup alternatives if primary doesn't sell within 2 weeks

      4. SELLING STRATEGY
      - Best day of week AND time of day to list (data-backed)
      - Realistic days-to-sell estimate
      - 3 specific tactics to trigger faster offers (e.g. "Best Offer" enabled, free shipping threshold, bundle deals)
      - 2 red flags in buyer messages to watch for

      Be decisive. Give specific numbers. No vague advice.`,
        response_json_schema: {
          type: "object",
          properties: {
            pricing_strategy: {
              type: "object",
              properties: {
                recommended_price: { type: "number" },
                rationale: { type: "string" },
                negotiation_buffer: { type: "string" },
                adjustment_timeline: { type: "string" }
              }
            },
            listing_optimization: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                key_features: { type: "array", items: { type: "string" } },
                photo_tips: { type: "array", items: { type: "string" } }
              }
            },
            platform_recommendation: {
              type: "object",
              properties: {
                primary_platform: { type: "string" },
                reasoning: { type: "string" },
                platform_tips: { type: "array", items: { type: "string" } },
                alternatives: { type: "array", items: { type: "string" } }
              }
            },
            selling_strategy: {
              type: "object",
              properties: {
                best_time_to_list: { type: "string" },
                expected_time_to_sell: { type: "string" },
                red_flags: { type: "array", items: { type: "string" } },
                quick_sale_tactics: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setAdvice(response);
    } catch (error) {
      console.error('Failed to generate selling advice:', error);
      setIsExpanded(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 overflow-hidden">
      <Button
        variant="ghost"
        onClick={generateSellingAdvice}
        className="w-full p-4 flex items-center justify-between hover:bg-purple-500/10 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Selling Assistant</h3>
            <p className="text-sm text-slate-400">Get personalized selling guidance</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-slate-900/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-purple-700 border-t-purple-400 rounded-full mb-3"
                  />
                  <p className="text-slate-400 text-sm">Analyzing market data...</p>
                </div>
              ) : advice ? (
                <>
                  {/* Pricing Strategy */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-semibold text-white text-sm">Pricing Strategy</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-emerald-400">
                        {advice.pricing_strategy.recommended_price != null ? `$${Number(advice.pricing_strategy.recommended_price).toFixed(0)}` : '—'}
                      </div>
                      <p className="text-sm text-slate-300">{advice.pricing_strategy.rationale}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-xs">
                          <span className="text-slate-500">Negotiation Buffer:</span>
                          <div className="text-slate-300 mt-0.5">{advice.pricing_strategy.negotiation_buffer}</div>
                        </div>
                        <div className="text-xs">
                          <span className="text-slate-500">Adjust After:</span>
                          <div className="text-slate-300 mt-0.5">{advice.pricing_strategy.adjustment_timeline}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Listing Optimization */}
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-semibold text-white text-sm">Listing Optimization</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-slate-500">Suggested Title:</span>
                        <div className="text-sm text-white font-medium mt-1 p-2 bg-slate-800/50 rounded">{advice.listing_optimization.title}</div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Description Template:</span>
                        <div className="text-sm text-slate-300 mt-1 p-2 bg-slate-800/50 rounded whitespace-pre-wrap">{advice.listing_optimization.description}</div>
                      </div>
                      {advice.listing_optimization.key_features?.length > 0 && (
                        <div>
                          <span className="text-xs text-slate-500">Key Features to Highlight:</span>
                          <ul className="mt-1 space-y-1">
                            {advice.listing_optimization.key_features.map((feature, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                                <span className="text-cyan-400">•</span> {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Platform Recommendation */}
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="w-4 h-4 text-purple-400" />
                      <h4 className="font-semibold text-white text-sm">Platform Selection</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-slate-500">Recommended Platform:</span>
                        <div className="text-lg font-bold text-purple-400 mt-0.5">{advice.platform_recommendation.primary_platform}</div>
                        <p className="text-sm text-slate-300 mt-1">{advice.platform_recommendation.reasoning}</p>
                      </div>
                      {advice.platform_recommendation.platform_tips?.length > 0 && (
                        <div>
                          <span className="text-xs text-slate-500">Platform Tips:</span>
                          <ul className="mt-1 space-y-1">
                            {advice.platform_recommendation.platform_tips.map((tip, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                                <span className="text-purple-400">•</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selling Strategy */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <h4 className="font-semibold text-white text-sm">Selling Strategy</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div>
                          <span className="text-slate-500 text-xs">Best Time to List:</span>
                          <div className="text-slate-300">{advice.selling_strategy.best_time_to_list}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div>
                          <span className="text-slate-500 text-xs">Expected Time to Sell:</span>
                          <div className="text-slate-300">{advice.selling_strategy.expected_time_to_sell}</div>
                        </div>
                      </div>
                      {advice.selling_strategy.quick_sale_tactics?.length > 0 && (
                        <div>
                          <span className="text-xs text-slate-500">Quick Sale Tactics:</span>
                          <ul className="mt-1 space-y-1">
                            {advice.selling_strategy.quick_sale_tactics.map((tactic, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                                <span className="text-amber-400">•</span> {tactic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}