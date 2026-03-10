import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Search, Camera, Gem, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function getItemValue(item) {
  const low = item.estimated_value_low || item.secondhand_price_low || item.new_price_low || 0;
  const high = item.estimated_value_high || item.secondhand_price_high || item.new_price_high || 0;
  return { low, high };
}

export default function CollectionDetail({ collection, onBack, onUpdate }) {
  const [showPicker, setShowPicker] = React.useState(false);

  const { data: allEvals = [] } = useQuery({
    queryKey: ['price-evaluations'],
    queryFn: () => base44.entities.PriceEvaluation.list('-created_date', 100),
  });

  const itemIds = collection.item_ids || [];
  const collectionItems = allEvals.filter(e => itemIds.includes(e.id));
  const availableItems = allEvals.filter(e => !itemIds.includes(e.id));

  const totalLow = collectionItems.reduce((s, i) => s + getItemValue(i).low, 0);
  const totalHigh = collectionItems.reduce((s, i) => s + getItemValue(i).high, 0);

  const addItem = async (evalItem) => {
    const newIds = [...itemIds, evalItem.id];
    const newLow = newIds.reduce((s, id) => {
      const it = allEvals.find(e => e.id === id);
      return s + (it ? getItemValue(it).low : 0);
    }, 0);
    const newHigh = newIds.reduce((s, id) => {
      const it = allEvals.find(e => e.id === id);
      return s + (it ? getItemValue(it).high : 0);
    }, 0);
    const updated = await base44.entities.Collection.update(collection.id, {
      item_ids: newIds,
      snapshot_value_low: collection.snapshot_value_low || newLow,
      snapshot_value_high: collection.snapshot_value_high || newHigh,
      snapshot_date: collection.snapshot_date || new Date().toISOString(),
    });
    onUpdate(updated);
    setShowPicker(false);
  };

  const removeItem = async (evalId) => {
    const newIds = itemIds.filter(id => id !== evalId);
    const updated = await base44.entities.Collection.update(collection.id, { item_ids: newIds });
    onUpdate(updated);
  };

  const takeSnapshot = async () => {
    const updated = await base44.entities.Collection.update(collection.id, {
      snapshot_value_low: totalLow,
      snapshot_value_high: totalHigh,
      snapshot_date: new Date().toISOString(),
    });
    onUpdate(updated);
  };

  const snapshotPct = collection.snapshot_value_low && totalLow
    ? (((totalLow - collection.snapshot_value_low) / collection.snapshot_value_low) * 100).toFixed(1)
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{collection.name}</h1>
          {collection.description && <p className="text-slate-400 text-sm truncate">{collection.description}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={takeSnapshot} className="border-slate-700 text-slate-300 text-xs hover:text-white">
          📸 Snapshot
        </Button>
      </div>

      {/* Value Summary */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 mb-4">
        <p className="text-xs text-slate-500 mb-1">Total Collection Value</p>
        <p className="text-2xl font-bold text-emerald-400">
          ${totalLow.toLocaleString()} – ${totalHigh.toLocaleString()}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          <span>{collectionItems.length} item{collectionItems.length !== 1 ? 's' : ''}</span>
          {snapshotPct !== null && (
            <span className={Number(snapshotPct) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {Number(snapshotPct) >= 0 ? '▲' : '▼'} {Math.abs(snapshotPct)}% vs snapshot ({new Date(collection.snapshot_date).toLocaleDateString()})
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {collectionItems.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">No items yet — add from your history below</p>
        )}
        {collectionItems.map(item => {
          const { low, high } = getItemValue(item);
          return (
            <div key={item.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center gap-3">
              {item.front_image_url || item.image_url ? (
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.front_image_url || item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                  {item.collectible_type ? <Gem className="w-4 h-4 text-amber-400" /> : item.search_query ? <Search className="w-4 h-4 text-purple-400" /> : <Camera className="w-4 h-4 text-cyan-400" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.item_name}</p>
                <p className="text-xs text-emerald-400">{low ? `$${low.toLocaleString()} – $${high.toLocaleString()}` : 'No value'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="w-7 h-7 text-slate-600 hover:text-red-400 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add items button */}
      <Button onClick={() => setShowPicker(true)} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-500 text-white">
        <Plus className="w-4 h-4" /> Add Items from History
      </Button>

      {/* Item Picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-end"
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-slate-900 border-t border-slate-700 rounded-t-2xl max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-white">Add from History</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowPicker(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3 space-y-2">
                {availableItems.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-6">All items are already in this collection</p>
                )}
                {availableItems.map(item => {
                  const { low, high } = getItemValue(item);
                  return (
                    <div key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:border-cyan-500/50 active:scale-[0.98] transition-all"
                      onClick={() => addItem(item)}
                    >
                      {item.front_image_url || item.image_url ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.front_image_url || item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                          {item.collectible_type ? <Gem className="w-4 h-4 text-amber-400" /> : <Search className="w-4 h-4 text-purple-400" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.item_name}</p>
                        <p className="text-xs text-slate-400">{item.category || item.collectible_type || ''}</p>
                      </div>
                      <span className="text-xs text-emerald-400 flex-shrink-0">{low ? `$${low.toLocaleString()}` : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}