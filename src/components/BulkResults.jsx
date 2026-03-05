import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POTENTIAL_COLORS = {
  high: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: TrendingUp, label: 'High' },
  medium: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400', icon: Minus, label: 'Medium' },
  low: { bg: 'bg-slate-700/50', border: 'border-slate-600', text: 'text-slate-400', icon: TrendingDown, label: 'Low' },
};

export default function BulkResults({ results, onBack }) {
  const sorted = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 };
    return [...results].sort((a, b) => (order[a.resale_potential] ?? 2) - (order[b.resale_potential] ?? 2));
  }, [results]);

  const topPicks = sorted.filter(r => r.resale_potential === 'high');
  const totalLow = results.reduce((s, r) => s + (r.secondhand_price_low || r.estimated_value_low || 0), 0);
  const totalHigh = results.reduce((s, r) => s + (r.secondhand_price_high || r.estimated_value_high || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-white">Batch Results</h2>
          <p className="text-slate-400 text-xs">{results.length} items evaluated</p>
        </div>
      </div>

      {/* Totals banner */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-slate-800/60 text-center">
          <div className="text-xs text-slate-500 mb-1">Items</div>
          <div className="text-xl font-bold text-white">{results.length}</div>
        </div>
        <div className="col-span-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <div className="text-xs text-emerald-400 mb-1">Total Batch Value</div>
          <div className="text-xl font-bold text-white">${totalLow.toFixed(0)}–${totalHigh.toFixed(0)}</div>
        </div>
      </div>

      {/* Top resale picks */}
      {topPicks.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-emerald-400">Best Quick-Resale Candidates</h3>
          </div>
          <div className="space-y-2">
            {topPicks.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.preview} alt={item.item_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{item.item_name}</div>
                  <div className="text-xs text-slate-400 truncate">{item.quick_sell_tip}</div>
                </div>
                <div className="text-sm font-bold text-emerald-400 flex-shrink-0">
                  ${(item.secondhand_price_low || item.estimated_value_low || 0).toFixed(0)}+
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary table */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">All Items</h3>
        <div className="space-y-2">
          {sorted.map((item, i) => {
            const pot = POTENTIAL_COLORS[item.resale_potential] || POTENTIAL_COLORS.low;
            const PotIcon = pot.icon;
            const low = item.secondhand_price_low || item.estimated_value_low || 0;
            const high = item.secondhand_price_high || item.estimated_value_high || 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${pot.bg} ${pot.border}`}
              >
                <img src={item.preview} alt={item.item_name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{item.item_name}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-400 capitalize">{item.condition_estimate?.replace('_', ' ')}</span>
                    {item.condition_score && (
                      <span className="text-xs text-slate-500">· {item.condition_score}/10</span>
                    )}
                  </div>
                  {item.resale_reason && (
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{item.resale_reason}</div>
                  )}
                </div>
                <div className="text-right flex-shrink-0 min-w-[70px]">
                  <div className="text-sm font-bold text-white">${low.toFixed(0)}–${high.toFixed(0)}</div>
                  <div className={`flex items-center justify-end gap-1 text-xs ${pot.text} mt-0.5`}>
                    <PotIcon className="w-3 h-3" />
                    {pot.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}