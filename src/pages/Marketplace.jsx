import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Store, TrendingUp, Package, RefreshCw, ExternalLink, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PullToRefresh from '@/components/PullToRefresh';

export default function Marketplace() {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: () => base44.entities.MarketplaceListing.list('-created_date', 50),
  });

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const response = await base44.functions.invoke('ebaySyncListings');
      
      if (response.data.needs_setup) {
        setSyncMessage({ type: 'error', text: 'Please configure eBay credentials first' });
      } else if (response.data.success) {
        setSyncMessage({ 
          type: 'success', 
          text: `Synced ${response.data.synced_count} listings` 
        });
        refetch();
      }
    } catch (error) {
      setSyncMessage({ type: 'error', text: 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const handleFetchSales = async () => {
    try {
      const response = await base44.functions.invoke('ebayGetSalesData');
      
      if (response.data.success) {
        setSyncMessage({ 
          type: 'success', 
          text: `Found ${response.data.total_orders} orders` 
        });
        refetch();
      }
    } catch (error) {
      setSyncMessage({ type: 'error', text: 'Failed to fetch sales data' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-500/20 text-emerald-400',
      sold: 'bg-purple-500/20 text-purple-400',
      pending: 'bg-amber-500/20 text-amber-400',
      ended: 'bg-slate-500/20 text-slate-400',
      failed: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || colors.pending;
  };

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    sold: listings.filter(l => l.status === 'sold').length,
    revenue: listings.reduce((sum, l) => sum + (parseFloat(l.sales_data?.sale_price) || 0), 0)
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 select-none">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-slate-400 text-sm">Manage your listings</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {syncMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
            syncMessage.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30' 
              : 'bg-red-500/10 border border-red-500/30'
          }`}
        >
          {syncMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm ${syncMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {syncMessage.text}
          </span>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-400">Active</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.active}</div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400">Sold</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.sold}</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">${stats.revenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Fetch Sales Button */}
      <Button
        variant="outline"
        className="w-full mb-4 border-slate-700"
        onClick={handleFetchSales}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Fetch Latest Sales Data
      </Button>

      {/* Listings */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full"
          />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 select-none">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No listings yet</p>
          <p className="text-slate-500 text-sm mt-1">Create a price evaluation to get started</p>
        </div>
      ) : (
        <PullToRefresh onRefresh={refetch}>
          <div className="space-y-3">
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
              >
                <div className="flex gap-3">
                  {listing.images?.[0] && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-white truncate">{listing.title}</h3>
                      {listing.listing_url && (
                        <a 
                          href={listing.listing_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        {listing.platform}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-emerald-400 font-medium">
                        ${(listing.price ?? 0).toFixed(2)}
                      </span>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {listing.last_synced ? new Date(listing.last_synced).toLocaleDateString() : 'Not synced'}
                      </div>
                    </div>

                    {listing.quantity_sold > 0 && (
                      <div className="mt-2 text-xs text-purple-400">
                        Sold: {listing.quantity_sold} / {listing.quantity}
                      </div>
                    )}
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