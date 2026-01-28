import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, TrendingUp, TrendingDown, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function SimilarItemCard({ item, index, onSelect }) {
  const avgNewPrice = ((item.new_price_low || 0) + (item.new_price_high || 0)) / 2;
  const avgUsedPrice = ((item.used_price_low || 0) + (item.used_price_high || 0)) / 2;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      onClick={() => onSelect(item)}
      className="w-full text-left p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {item.name}
          </h4>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">{item.reason}</p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">New:</span>
              <span className="text-sm font-medium text-cyan-400">${avgNewPrice.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Used:</span>
              <span className="text-sm font-medium text-purple-400">${avgUsedPrice.toFixed(0)}</span>
            </div>
            {item.price_difference && (
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                item.price_difference.includes('cheaper') 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : item.price_difference.includes('more')
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-slate-700 text-slate-300'
              }`}>
                {item.price_difference.includes('cheaper') ? (
                  <TrendingDown className="w-3 h-3" />
                ) : item.price_difference.includes('more') ? (
                  <TrendingUp className="w-3 h-3" />
                ) : null}
                {item.price_difference}
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </motion.button>
  );
}

export default function SimilarItems({ itemName, category, onSelectItem }) {
  const [similarItems, setSimilarItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarItems = async () => {
      setIsLoading(true);
      setError(null);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 4-5 similar alternative items to "${itemName}" (category: ${category || 'general'}). 
        Search the internet for current competitors and alternatives with their real market prices.
        
        For each similar item provide:
        - Name of the alternative product
        - Why it's a good alternative (brief reason)
        - New retail price range
        - Used/secondhand price range  
        - How the price compares to the original item (e.g., "20% cheaper", "similar price", "30% more expensive")
        
        Focus on popular alternatives that are currently available in the market.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            similar_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  new_price_low: { type: "number" },
                  new_price_high: { type: "number" },
                  used_price_low: { type: "number" },
                  used_price_high: { type: "number" },
                  price_difference: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSimilarItems(response.similar_items || []);
      setIsLoading(false);
    };

    if (itemName) {
      fetchSimilarItems();
    }
  }, [itemName, category]);

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-white">Compare Similar Items</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-6 h-6 text-indigo-400" />
          </motion.div>
          <span className="ml-3 text-slate-400">Finding alternatives...</span>
        </div>
      </div>
    );
  }

  if (error || similarItems.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-indigo-400" />
        <h3 className="font-semibold text-white">Compare Similar Items</h3>
      </div>
      
      <div className="space-y-3">
        {similarItems.map((item, index) => (
          <SimilarItemCard
            key={index}
            item={item}
            index={index}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </motion.div>
  );
}