import React from 'react';
import { motion } from 'framer-motion';
import { Package, RefreshCw, Gavel, ShoppingCart, Store, TrendingUp, TrendingDown, ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SimilarItems from './SimilarItems';
import ResaleOpportunityFinder from './ResaleOpportunityFinder';
import ConditionDetails from './ConditionDetails';
import PullToRefresh from './PullToRefresh';
import SellingAssistant from './SellingAssistant';
import MarketplaceQuickList from './MarketplaceQuickList';

function PriceCard({ title, icon: Icon, lowPrice, highPrice, color, delay = 0 }) {
  const low = lowPrice || 0;
  const high = highPrice || 0;
  const avgPrice = (low + high) / 2;
  
  const colorMap = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-xl border ${colorMap[color].border} ${colorMap[color].bg} p-4`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${colorMap[color].text}`} />
        <span className="text-slate-300 font-medium text-sm">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">${avgPrice.toFixed(0)}</div>
      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
        <TrendingDown className="w-3 h-3" />${low.toFixed(0)}
        <span>-</span>
        <TrendingUp className="w-3 h-3" />${high.toFixed(0)}
      </div>
    </motion.div>
  );
}

function RecommendationItem({ rec, type, index }) {
  const isBuy = type === 'buy';
  const Wrapper = rec.url ? 'a' : 'div';
  const wrapperProps = rec.url ? { href: rec.url, target: '_blank', rel: 'noopener noreferrer' } : {};
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <Wrapper
        {...wrapperProps}
        className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 ${rec.url ? 'hover:border-slate-600 hover:bg-slate-800 cursor-pointer transition-all' : ''}`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
          isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {rec.platform?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate flex items-center gap-2">
            {rec.platform}
            {rec.is_local && <MapPin className="w-3 h-3 text-emerald-400" />}
            {rec.url && <ExternalLink className="w-3 h-3 text-slate-500" />}
          </div>
          <div className="text-sm text-slate-400">
            {isBuy ? rec.price_range : `${rec.expected_price} • ${rec.fees || 'Low fees'}`}
          </div>
        </div>
      </Wrapper>
    </motion.div>
  );
}

export default function PriceResults({ result, onBack, onSearchSimilar }) {
  if (!result) return null;

  const handleRefresh = async () => {
    // Re-trigger search for same item
    if (result.search_query) {
      await onSearchSimilar(result.search_query);
    }
  };

  const handleSelectSimilarItem = (item) => {
    if (onSearchSimilar) {
      onSearchSimilar(item.name);
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-slate-400 hover:text-white mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          {result.image_url && (
            <div className="w-20 h-20 rounded-xl overflow-hidden mb-3">
              <img src={result.image_url} alt={result.item_name} className="w-full h-full object-cover" />
            </div>
          )}
          <h2 className="text-xl font-bold text-white">{result.item_name}</h2>
          <p className="text-slate-400 text-sm mt-1">{result.item_description}</p>
  {result.condition_estimate && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300 capitalize">
                  {result.condition_estimate.replace('_', ' ')} condition
                </span>
                {result.condition_score && (
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    result.condition_score >= 8 ? 'bg-emerald-500/20 text-emerald-400' :
                    result.condition_score >= 6 ? 'bg-cyan-500/20 text-cyan-400' :
                    result.condition_score >= 4 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {result.condition_score}/10
                  </span>
                )}
              </div>
              <ConditionDetails 
                conditionDetails={result.condition_details} 
                conditionScore={result.condition_score}
              />
            </div>
          )}
        </div>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-3 gap-3">
        <PriceCard
          title="New"
          icon={Package}
          lowPrice={result.new_price_low || 0}
          highPrice={result.new_price_high || 0}
          color="cyan"
          delay={0.1}
        />
        <PriceCard
          title="Used"
          icon={RefreshCw}
          lowPrice={result.secondhand_price_low || 0}
          highPrice={result.secondhand_price_high || 0}
          color="purple"
          delay={0.2}
        />
        <PriceCard
          title="Auction"
          icon={Gavel}
          lowPrice={result.auction_price_low || 0}
          highPrice={result.auction_price_high || 0}
          color="amber"
          delay={0.3}
        />
      </div>

      {/* Buy Recommendations */}
      {result.buy_recommendations?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white">Where to Buy</h3>
          </div>
          <div className="space-y-2">
            {result.buy_recommendations.map((rec, i) => (
              <RecommendationItem key={i} rec={rec} type="buy" index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Resale Opportunity Finder */}
      <ResaleOpportunityFinder result={result} />

      {/* AI Selling Assistant */}
      <SellingAssistant result={result} />

      {/* Quick List to eBay */}
      <MarketplaceQuickList result={result} />

      {/* Sell Recommendations */}
      {result.sell_recommendations?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Store className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white">Where to Sell</h3>
          </div>
          <div className="space-y-2">
            {result.sell_recommendations.map((rec, i) => (
              <RecommendationItem key={i} rec={rec} type="sell" index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Similar Items Comparison */}
      <SimilarItems 
        itemName={result.item_name} 
        category={result.category}
        onSelectItem={handleSelectSimilarItem}
      />
      </motion.div>
    </PullToRefresh>
  );
}