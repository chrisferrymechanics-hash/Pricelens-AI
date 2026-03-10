import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ExternalLink, X, TrendingDown, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BuyOpportunities() {
  const queryClient = useQueryClient();

  const { data: rawOpps = [], isLoading } = useQuery({
    queryKey: ['buy-opportunities'],
    queryFn: () => base44.entities.BuyOpportunity.list('-created_date', 50),
    refetchInterval: 60_000,
  });

  const opps = rawOpps.filter((o) => !o.is_dismissed);

  const [isScanning, setIsScanning] = React.useState(false);

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.BuyOpportunity.update(id, { is_dismissed: true }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['buy-opportunities'] });
      const prev = queryClient.getQueryData(['buy-opportunities']);
      queryClient.setQueryData(['buy-opportunities'], (old) => (old ?? []).filter((o) => o.id !== id));
      return { prev };
    },
    onError: (err, id, ctx) => queryClient.setQueryData(['buy-opportunities'], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['buy-opportunities'] }),
  });

  const handleScanNow = async () => {
    setIsScanning(true);
    try {
      await base44.functions.invoke('scanMarketplaceBuys', {});
      await queryClient.invalidateQueries({ queryKey: ['buy-opportunities'] });
    } finally {
      setIsScanning(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Buy Opportunities</h2>
          {opps.length > 0 && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              {opps.length}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleScanNow}
          disabled={isScanning}
          className="text-slate-400 hover:text-white text-xs h-7 px-2"
        >
          {isScanning ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          {isScanning ? 'Scanning...' : 'Scan now'}
        </Button>
      </div>

      {opps.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-700/50 rounded-xl">
          <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No buy opportunities found yet</p>
          <p className="text-slate-600 text-xs mt-1">
            Scans run automatically every 12 hours — or tap "Scan now"
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {opps.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3"
              >
                <div className="flex gap-2 items-start">
                  {opp.image_url ? (
                    <img
                      src={opp.image_url}
                      alt={opp.item_name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-emerald-800/40 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="text-xs text-slate-400 font-medium truncate">{opp.item_name}</p>
                        <p className="text-sm text-white font-medium leading-tight mt-0.5 line-clamp-2">
                          {opp.listing_title}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissMutation.mutate(opp.id)}
                        className="text-slate-600 hover:text-slate-400 flex-shrink-0 mt-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge className="bg-slate-700/60 text-slate-300 border-slate-600/40 text-xs">
                        {opp.platform}
                      </Badge>
                      <span className="text-emerald-400 font-bold text-sm">
                        ${opp.listing_price?.toFixed(2)}
                      </span>
                      <span className="text-slate-500 text-xs line-through">
                        avg ${opp.historical_avg?.toFixed(2)}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-bold">
                        -{opp.discount_pct}%
                      </Badge>
                    </div>

                    <a
                      href={opp.listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1.5"
                    >
                      View listing <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}