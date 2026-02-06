import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';

const serviceColors = {
  PSA: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  BGS: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  CGC: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  PCGS: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  NGC: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  SGC: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  default: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' }
};

function GradingCard({ estimate, index }) {
  const [expanded, setExpanded] = useState(false);
  const colors = serviceColors[estimate.service] || serviceColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Award className={`w-5 h-5 ${colors.text}`} />
          <span className={`font-bold text-lg ${colors.text}`}>{estimate.service}</span>
        </div>
        <div className={`text-2xl font-bold ${colors.text}`}>
          {estimate.estimated_grade}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3">
        Scale: {estimate.scale}
      </div>

      {estimate.subgrades && Object.keys(estimate.subgrades).length > 0 && (
        <div className="space-y-1 mb-3">
          <div className="text-xs font-medium text-slate-400">Subgrades:</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(estimate.subgrades).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-slate-500 capitalize">{key}:</span>
                <span className={`ml-1 font-medium ${colors.text}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {estimate.notes && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide' : 'Show'} Details
          </button>
          
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 text-xs text-slate-400 leading-relaxed"
            >
              {estimate.notes}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default function GradingEstimates({ estimates }) {
  if (!estimates || estimates.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-4 h-4 text-purple-400" />
        <h3 className="font-semibold text-white">Multi-Service Grading Estimates</h3>
      </div>
      <div className="grid gap-3">
        {estimates.map((estimate, index) => (
          <GradingCard key={index} estimate={estimate} index={index} />
        ))}
      </div>
    </div>
  );
}