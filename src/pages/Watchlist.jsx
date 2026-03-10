import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, TrendingUp, TrendingDown, Camera, Search, Gem, RefreshCw, Bell } from 'lucide-react';
import ExportCSV from '@/components/ExportCSV';
import { Button } from '@/components/ui/button';
import PullToRefresh from '@/components/PullToRefresh';

const THRESHOLD_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function Watchlist() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => base44.entities.WatchlistItem.list('-created_date', 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WatchlistItem.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const prev = queryClient.getQueryData(['watchlist']);
      queryClient.setQueryData(['watchlist'], old => old.filter(i => i.id !== id));
      return { prev };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['watchlist'], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const updateThresholdMutation = useMutation({
    mutationFn: ({ id, threshold }) => base44.entities.WatchlistItem.update(id, { alert_threshold: threshold }),
    onMutate: async ({ id, threshold }) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const prev = queryClient.getQueryData(['watchlist']);
      queryClient.setQueryData(['watchlist'], old => old.map(i => i.id === id ? { ...i, alert_threshold: threshold } : i));
      return { prev };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['watchlist'], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getPriceChangeIndicator = (item) => {
    const current = item.last_known_value_low && item.last_known_value_high
      ? (item.last_known_value_low + item.last_known_value_high) / 2
      : null;
    const atAlert = item.last_alert_value_low;
    if (!current || !atAlert) return null;
    const pct = ((current - atAlert) / atAlert) * 100;
    if (Math.abs(pct) < 5) return null;
    return { pct: pct.toFixed(0), up: pct > 0 };
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6 select-none">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Watchlist</h1>
            <p className="text-slate-400 text-sm">Track items & get price alerts</p>
          </div>
          {items.length > 0 && (
            <ExportCSV items={items} source="watchlist" label="Export CSV" />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full"
          />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 select-none">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No watched items yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Tap the <Bookmark className="inline w-3.5 h-3.5 mx-1" /> icon on any history item to start watching it
          </p>
        </div>
      ) : (
        <PullToRefresh onRefresh={refetch}>
          <div className="space-y-2">
            {items.map((item, index) => {
              const change = getPriceChangeIndicator(item);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-colors"
                >
                  <div className="flex gap-2 items-center">
                    {/* Image / Icon */}
                    {item.image_url ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                        {item.collectible_type ? (
                          <Gem className="w-5 h-5 text-amber-400" />
                        ) : item.search_query ? (
                          <Search className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Camera className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-white truncate text-sm">{item.item_name}</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {change ? (
                            change.up ? (
                              <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-medium">
                                <TrendingUp className="w-3.5 h-3.5" />+{change.pct}%
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-xs text-red-400 font-medium">
                                <TrendingDown className="w-3.5 h-3.5" />{change.pct}%
                              </span>
                            )
                          ) : null}
                          {item.last_known_value_low && (
                            <span className="text-sm text-emerald-400 font-medium whitespace-nowrap">
                              ${item.last_known_value_low?.toFixed(0)}–${item.last_known_value_high?.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <RefreshCw className="w-3 h-3 text-slate-600" />
                        <span className="text-xs text-slate-500">
                          {item.last_checked ? `Updated ${formatDate(item.last_checked)}` : 'Not checked yet'}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="text-slate-500 hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </PullToRefresh>
      )}

      <p className="text-xs text-slate-600 text-center mt-6 select-none">
        Price checks run automatically every 12 hours. You'll get an email alert when value changes by 10%+.
      </p>
    </div>
  );
}