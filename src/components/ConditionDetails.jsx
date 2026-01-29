import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, CheckCircle, Info, Eye } from 'lucide-react';

const severityColors = {
  minor: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  moderate: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  severe: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

function DefectItem({ defect, index }) {
  const colors = severityColors[defect.severity] || severityColors.minor;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm">{defect.type}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} capitalize`}>
              {defect.severity}
            </span>
          </div>
          {defect.location && (
            <p className="text-slate-400 text-xs mt-1">Location: {defect.location}</p>
          )}
          {defect.price_impact && (
            <p className="text-slate-500 text-xs mt-1">💰 {defect.price_impact}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ConditionDetails({ conditionDetails, conditionScore }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!conditionDetails) return null;

  const { summary, defects_found, wear_level, functionality_assessment, cosmetic_rating, completeness } = conditionDetails;
  const hasDefects = defects_found && defects_found.length > 0;

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span className="font-medium text-white text-sm">Detailed Condition Analysis</span>
          {hasDefects && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              {defects_found.length} issue{defects_found.length > 1 ? 's' : ''} found
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 border-x border-b border-slate-700/50 rounded-b-xl bg-slate-900/50">
              {/* Summary */}
              {summary && (
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">{summary}</p>
                </div>
              )}

              {/* Ratings Grid */}
              <div className="grid grid-cols-2 gap-3">
                {cosmetic_rating && (
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Cosmetic Rating</div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            cosmetic_rating >= 8 ? 'bg-emerald-500' :
                            cosmetic_rating >= 6 ? 'bg-cyan-500' :
                            cosmetic_rating >= 4 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cosmetic_rating * 10}%` }}
                        />
                      </div>
                      <span className="text-white font-medium text-sm">{cosmetic_rating}/10</span>
                    </div>
                  </div>
                )}
                {wear_level && (
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Wear Level</div>
                    <div className="text-white text-sm font-medium capitalize">{wear_level}</div>
                  </div>
                )}
              </div>

              {/* Functionality & Completeness */}
              <div className="space-y-2">
                {functionality_assessment && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Functionality</div>
                      <p className="text-slate-300 text-sm">{functionality_assessment}</p>
                    </div>
                  </div>
                )}
                {completeness && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/30">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Completeness</div>
                      <p className="text-slate-300 text-sm">{completeness}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Defects List */}
              {hasDefects && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Issues Detected
                  </h4>
                  <div className="space-y-2">
                    {defects_found.map((defect, i) => (
                      <DefectItem key={i} defect={defect} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {!hasDefects && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">No significant defects detected</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}