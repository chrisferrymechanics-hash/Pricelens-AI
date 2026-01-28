import React, { useState } from 'react';
import { Search, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function KeywordSearch({ onSearch, isProcessing }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const suggestions = [
    'iPhone 14 Pro',
    'Nintendo Switch',
    'MacBook Air M2',
    'PS5 Controller',
    'Dyson V15',
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any item (e.g. iPhone 14 Pro)"
            className="pl-12 pr-4 h-14 bg-slate-800/50 border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
          />
        </div>
        
        <Button
          type="submit"
          disabled={!query.trim() || isProcessing}
          className="w-full mt-3 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Searching...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Search Prices
            </div>
          )}
        </Button>
      </form>

      {/* Quick Suggestions */}
      <div className="pt-2">
        <p className="text-slate-400 text-sm mb-3">Popular searches</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              onClick={() => setQuery(item)}
              className="px-3 py-1.5 text-sm bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-full text-slate-300 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}