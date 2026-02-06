import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, AlertTriangle, TrendingUp, ExternalLink, MapPin, Award, Sparkles, Shield, Hash, Calendar, Pen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

function RarityBadge({ rarity, score }) {
  const rarityConfig = {
    common: { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-400', label: 'Common' },
    uncommon: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', label: 'Uncommon' },
    rare: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Rare' },
    very_rare: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Very Rare' },
    extremely_rare: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Extremely Rare' },
    legendary: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', label: 'Legendary' },
  };

  const config = rarityConfig[rarity] || rarityConfig.common;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}>
      <Star className={`w-4 h-4 ${config.text}`} />
      <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
      {score && <span className={`text-xs ${config.text}`}>({score}/10)</span>}
    </div>
  );
}

function AuthenticityIndicator({ authenticity }) {
  if (!authenticity) return null;
  
  const isLikelyAuthentic = authenticity.confidence >= 70;
  
  return (
    <div className={`p-3 rounded-xl border ${isLikelyAuthentic ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Shield className={`w-4 h-4 ${isLikelyAuthentic ? 'text-emerald-400' : 'text-amber-400'}`} />
        <span className={`font-medium text-sm ${isLikelyAuthentic ? 'text-emerald-400' : 'text-amber-400'}`}>
          Authenticity: {authenticity.confidence}% confidence
        </span>
      </div>
      <p className="text-xs text-slate-400">{authenticity.notes}</p>
    </div>
  );
}

function TradingPlatformItem({ platform, index }) {
  const Wrapper = platform.url ? 'a' : 'div';
  const wrapperProps = platform.url ? { href: platform.url, target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <Wrapper
        {...wrapperProps}
        className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 ${platform.url ? 'hover:border-amber-500/50 hover:bg-slate-800 cursor-pointer transition-all' : ''}`}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold bg-amber-500/10 text-amber-400">
          {platform.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate flex items-center gap-2">
            {platform.name}
            {platform.is_specialized && <Award className="w-3 h-3 text-amber-400" />}
            {platform.is_local && <MapPin className="w-3 h-3 text-emerald-400" />}
            {platform.url && <ExternalLink className="w-3 h-3 text-slate-500" />}
          </div>
          <div className="text-sm text-slate-400">{platform.price_range}</div>
          {platform.notes && <div className="text-xs text-slate-500 mt-0.5">{platform.notes}</div>}
        </div>
      </Wrapper>
    </motion.div>
  );
}

export default function CollectiblesResults({ result, onBack }) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-slate-400 hover:text-white mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          {/* Images */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {result.front_image_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                <img src={result.front_image_url} alt="Image 1" className="w-full h-full object-cover" />
              </div>
            )}
            {result.back_image_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                <img src={result.back_image_url} alt="Image 2" className="w-full h-full object-cover" />
              </div>
            )}
            {result.additional_image_urls?.map((url, i) => (
              <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                <img src={url} alt={`Image ${i + 3}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium uppercase">{result.collectible_type}</span>
          </div>
          
          <h2 className="text-xl font-bold text-white">{result.item_name}</h2>
          <p className="text-slate-400 text-sm mt-1">{result.item_description}</p>
          
          {/* Rarity Badge */}
          <div className="mt-3">
            <RarityBadge rarity={result.rarity} score={result.rarity_score} />
          </div>
        </div>
      </div>

      {/* Authenticity */}
      <AuthenticityIndicator authenticity={result.authenticity} />

      {/* Extracted Details */}
      {(result.serial_number || result.mint_mark || result.artist_signature || result.year || result.edition) && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-cyan-400" />
            Extracted Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {result.serial_number && (
              <div>
                <span className="text-slate-500">Serial Number:</span>
                <div className="text-white font-mono mt-0.5">{result.serial_number}</div>
              </div>
            )}
            {result.mint_mark && (
              <div>
                <span className="text-slate-500">Mint Mark:</span>
                <div className="text-white font-mono mt-0.5">{result.mint_mark}</div>
              </div>
            )}
            {result.year && (
              <div>
                <span className="text-slate-500">Year:</span>
                <div className="text-white mt-0.5">{result.year}</div>
              </div>
            )}
            {result.edition && (
              <div>
                <span className="text-slate-500">Edition:</span>
                <div className="text-white mt-0.5">{result.edition}</div>
              </div>
            )}
            {result.artist_signature && (
              <div className="col-span-2">
                <span className="text-slate-500 flex items-center gap-1">
                  <Pen className="w-3 h-3" /> Artist Signature:
                </span>
                <div className="text-white font-serif italic mt-0.5">{result.artist_signature}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Details */}
      {result.key_identifiers && result.key_identifiers.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            Key Identifiers
          </h3>
          <ul className="space-y-2">
            {result.key_identifiers.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Estimates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="text-xs text-emerald-400 mb-1">Estimated Value</div>
          <div className="text-xl font-bold text-white">
            ${result.estimated_value_low?.toFixed(0)} - ${result.estimated_value_high?.toFixed(0)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <div className="text-xs text-purple-400 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Graded Value
          </div>
          <div className="text-xl font-bold text-white">
            ${result.graded_value_low?.toFixed(0)} - ${result.graded_value_high?.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Multi-Service Grading Estimates */}
      {result.grading_estimates && result.grading_estimates.length > 0 && (
        <GradingEstimates estimates={result.grading_estimates} />
      )}

      {/* Grading Standards */}
      {result.grading_standards && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            {result.grading_standards.service} Grading Standards
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Scale:</span>
              <span className="text-white ml-2">{result.grading_standards.scale}</span>
            </div>
            {result.grading_standards.estimated_grade && (
              <div>
                <span className="text-slate-500">Estimated Grade:</span>
                <span className="text-purple-400 ml-2 font-bold">{result.grading_standards.estimated_grade}</span>
              </div>
            )}
            {result.grading_standards.criteria && (
              <div>
                <span className="text-slate-500">Criteria:</span>
                <p className="text-slate-400 mt-1">{result.grading_standards.criteria}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Sales */}
      {result.historical_sales && result.historical_sales.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Recent Verified Sales
          </h3>
          <div className="space-y-2">
            {result.historical_sales.map((sale, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">${sale.price?.toFixed(0)}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <Calendar className="w-3 h-3" />
                    {sale.date}
                    {sale.grading_service && ` • ${sale.grading_service}`}
                    {sale.grade && ` ${sale.grade}`}
                    • {sale.platform}
                  </div>
                </div>
                {sale.url && (
                  <a href={sale.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grading Info */}
      {result.grading_recommendation && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-2">Grading Recommendation</h3>
          <p className="text-sm text-slate-400">{result.grading_recommendation}</p>
        </div>
      )}

      {/* Trading Platforms */}
      {result.trading_platforms && result.trading_platforms.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-white">Recommended Trading Platforms</h3>
          </div>
          <div className="space-y-2">
            {result.trading_platforms.map((platform, i) => (
              <TradingPlatformItem key={i} platform={platform} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}