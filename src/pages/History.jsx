import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Clock, Search, Camera, Gem, Trash2 } from 'lucide-react';
import ExportPDF from '@/components/ExportPDF';
import { Button } from '@/components/ui/button';
import PullToRefresh from '@/components/PullToRefresh';

export default function History() {
  const { data: evaluations = [], isLoading, refetch } = useQuery({
    queryKey: ['price-evaluations'],
    queryFn: () => base44.entities.PriceEvaluation.list('-created_date', 50),
  });

  const [deletedIds, setDeletedIds] = React.useState(new Set());

  const handleDelete = async (id) => {
    // Optimistic update
    setDeletedIds(prev => new Set(prev).add(id));
    try {
      await base44.entities.PriceEvaluation.delete(id);
      refetch();
    } catch (error) {
      // Revert on error
      setDeletedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const visibleEvaluations = evaluations.filter(item => !deletedIds.has(item.id));

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 select-none">
        <h1 className="text-2xl font-bold text-white">Search History</h1>
        <p className="text-slate-400 text-sm">Your past evaluations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full"
          />
        </div>
      ) : visibleEvaluations.length === 0 ? (
        <div className="text-center py-12 select-none">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No search history yet</p>
          <p className="text-slate-500 text-sm mt-1">Your evaluations will appear here</p>
        </div>
      ) : (
        <PullToRefresh onRefresh={refetch}>
          <div className="space-y-2">
            {visibleEvaluations.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-colors"
            >
              <div className="flex gap-2 items-center">
                {/* Image or Icon */}
                {item.image_url || item.front_image_url ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.front_image_url || item.image_url} 
                      alt={item.item_name} 
                      className="w-full h-full object-cover"
                    />
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
                     {(item.new_price_low || item.estimated_value_low) && (
                       <span className="text-sm text-emerald-400 font-medium whitespace-nowrap">
                         ${(item.estimated_value_low || item.secondhand_price_low || item.new_price_low)?.toFixed(0)}–${(item.estimated_value_high || item.secondhand_price_high || item.new_price_high)?.toFixed(0)}
                       </span>
                     )}
                   </div>
                   <div className="flex items-center gap-2 mt-0.5">
                     <span className="text-xs text-slate-500">{formatDate(item.created_date)}</span>
                     {item.collectible_type && (
                       <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                         {item.collectible_type}
                       </span>
                     )}
                   </div>
                 </div>

                {/* Actions */}
                 <div className="flex items-center flex-shrink-0">
                   <ExportPDF item={item} />
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => handleDelete(item.id)}
                     className="text-slate-500 hover:text-red-400"
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
              </div>
            </motion.div>
            ))}
          </div>
        </PullToRefresh>
      )}
    </div>
  );
}