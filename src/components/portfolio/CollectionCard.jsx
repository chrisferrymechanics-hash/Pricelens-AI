import React from 'react';
import { motion } from 'framer-motion';
import { Folder, TrendingUp, TrendingDown, Minus, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = {
  cyan:   { bg: 'bg-cyan-500/15',   border: 'border-cyan-500/30',   text: 'text-cyan-400',   dot: 'bg-cyan-400' },
  amber:  { bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  purple: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' },
  emerald:{ bg: 'bg-emerald-500/15',border: 'border-emerald-500/30',text: 'text-emerald-400',dot: 'bg-emerald-400' },
  rose:   { bg: 'bg-rose-500/15',   border: 'border-rose-500/30',   text: 'text-rose-400',   dot: 'bg-rose-400' },
};

export default function CollectionCard({ collection, totalLow, totalHigh, itemCount, snapshotLow, index, onClick, onDelete }) {
  const c = COLORS[collection.color] || COLORS.cyan;

  const pct = snapshotLow && totalLow
    ? (((totalLow - snapshotLow) / snapshotLow) * 100).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`${c.bg} ${c.border} border rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center flex-shrink-0`}>
            <Folder className={`w-5 h-5 ${c.text}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{collection.name}</h3>
            <p className="text-xs text-slate-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost" size="icon"
            className="w-7 h-7 text-slate-600 hover:text-red-400"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Total Est. Value</p>
          {totalLow != null ? (
            <p className={`text-lg font-bold ${c.text}`}>
              ${Number(totalLow).toLocaleString()} – ${Number(totalHigh).toLocaleString()}
            </p>
          ) : (
            <p className="text-slate-500 text-sm">No values yet</p>
          )}
        </div>
        {pct !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${Number(pct) >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
            {Number(pct) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Number(pct) >= 0 ? '+' : ''}{pct}% vs snapshot
          </div>
        )}
      </div>
    </motion.div>
  );
}