import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Layers, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CollectionCard from '@/components/portfolio/CollectionCard';
import CollectionDetail from '@/components/portfolio/CollectionDetail';

const COLORS = ['cyan', 'amber', 'purple', 'emerald', 'rose'];

function getItemValue(item) {
  const low = item.estimated_value_low || item.secondhand_price_low || item.new_price_low || 0;
  const high = item.estimated_value_high || item.secondhand_price_high || item.new_price_high || 0;
  return { low, high };
}

export default function Portfolio() {
  const queryClient = useQueryClient();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('cyan');

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => base44.entities.Collection.list('-created_date', 50),
  });

  const { data: allEvals = [] } = useQuery({
    queryKey: ['price-evaluations'],
    queryFn: () => base44.entities.PriceEvaluation.list('-created_date', 100),
  });

  const totalPortfolioLow = allEvals.reduce((s, i) => s + getItemValue(i).low, 0);
  const totalPortfolioHigh = allEvals.reduce((s, i) => s + getItemValue(i).high, 0);

  const getCollectionTotals = (collection) => {
    const ids = collection.item_ids || [];
    const items = allEvals.filter(e => ids.includes(e.id));
    const totalLow = items.reduce((s, i) => s + getItemValue(i).low, 0);
    const totalHigh = items.reduce((s, i) => s + getItemValue(i).high, 0);
    return { totalLow, totalHigh, itemCount: items.length };
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await base44.entities.Collection.create({
      name: newName.trim(),
      description: newDesc.trim() || undefined,
      color: newColor,
      item_ids: [],
    });
    queryClient.invalidateQueries({ queryKey: ['collections'] });
    setNewName(''); setNewDesc(''); setNewColor('cyan'); setShowCreate(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Collection.delete(id);
    queryClient.invalidateQueries({ queryKey: ['collections'] });
  };

  const handleUpdate = (updated) => {
    queryClient.setQueryData(['collections'], old =>
      old.map(c => c.id === updated.id ? updated : c)
    );
    setSelectedCollection(updated);
  };

  if (selectedCollection) {
    return (
      <CollectionDetail
        collection={selectedCollection}
        onBack={() => setSelectedCollection(null)}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-slate-400 text-sm">Organize & track your collections</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white">
          <Plus className="w-4 h-4" /> New
        </Button>
      </div>

      {/* Overall summary */}
      {allEvals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-4 mb-5 mt-4"
        >
          <p className="text-xs text-slate-400 mb-1">Total Portfolio Value (all items)</p>
          <p className="text-2xl font-bold text-white">
            ${totalPortfolioLow.toLocaleString()} – ${totalPortfolioHigh.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">{allEvals.length} evaluated items across {collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        </motion.div>
      )}

      {/* Collections */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full"
          />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 select-none">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No collections yet</p>
          <p className="text-slate-500 text-sm mt-1">Create a collection to group and track your items</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((col, i) => {
            const { totalLow, totalHigh, itemCount } = getCollectionTotals(col);
            return (
              <CollectionCard
                key={col.id}
                collection={col}
                totalLow={totalLow || null}
                totalHigh={totalHigh || null}
                itemCount={itemCount}
                snapshotLow={col.snapshot_value_low}
                index={i}
                onClick={() => setSelectedCollection(col)}
                onDelete={() => handleDelete(col.id)}
              />
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-end"
          onClick={() => setShowCreate(false)}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full bg-slate-900 border-t border-slate-700 rounded-t-2xl p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-lg">New Collection</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500 mb-3 text-sm"
              placeholder="Collection name (e.g. Vintage Coins)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500 mb-4 text-sm"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
            {/* Color picker */}
            <div className="flex gap-2 mb-5">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${newColor === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                  style={{ backgroundColor: { cyan: '#22d3ee', amber: '#fbbf24', purple: '#a78bfa', emerald: '#34d399', rose: '#fb7185' }[c] }}
                />
              ))}
            </div>
            <Button onClick={handleCreate} disabled={!newName.trim()} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
              Create Collection
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}