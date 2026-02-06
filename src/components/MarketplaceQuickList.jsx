import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarketplaceListingForm from './MarketplaceListingForm';

export default function MarketplaceQuickList({ result }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-blue-500/10 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Store className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">List on eBay</h3>
            <p className="text-sm text-slate-400">Create a marketplace listing</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-blue-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-900/50">
              <MarketplaceListingForm 
                result={result}
                onSuccess={() => setIsExpanded(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}