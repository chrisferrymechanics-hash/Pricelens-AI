import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BulkResults from './BulkResults';

export default function BulkUpload({ isProcessing, setIsProcessing }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]); // [{file, preview}]
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const newFiles = selected.slice(0, 20).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2)
    }));
    setFiles(prev => [...prev, ...newFiles].slice(0, 20));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    const batchResults = [];

    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length });
      const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i].file });

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this item image. Identify the item, assess its condition, and search the internet for current market prices. Return a concise pricing summary.`,
        add_context_from_internet: true,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            item_name: { type: "string" },
            category: { type: "string" },
            condition_estimate: { type: "string", enum: ["new", "like_new", "good", "fair", "poor"] },
            condition_score: { type: "number" },
            estimated_value_low: { type: "number" },
            estimated_value_high: { type: "number" },
            secondhand_price_low: { type: "number" },
            secondhand_price_high: { type: "number" },
            resale_potential: { type: "string", enum: ["high", "medium", "low"] },
            resale_reason: { type: "string" },
            quick_sell_tip: { type: "string" }
          }
        }
      });

      batchResults.push({ ...res, preview: files[i].preview, file_url });

      await base44.entities.PriceEvaluation.create({
        item_name: res.item_name,
        image_url: file_url,
        category: res.category,
        condition_estimate: res.condition_estimate,
        condition_score: res.condition_score,
        secondhand_price_low: res.secondhand_price_low,
        secondhand_price_high: res.secondhand_price_high,
      });
    }

    setResults(batchResults);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFiles([]);
    setResults(null);
    setProgress({ current: 0, total: 0 });
  };

  if (results) {
    return <BulkResults results={results} onBack={handleReset} />;
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="aspect-[4/3] max-h-52 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl cursor-pointer border-2 border-dashed border-slate-600 hover:border-cyan-500/60 transition-colors flex flex-col items-center justify-center gap-3"
      >
        <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-400/30">
          <Upload className="w-8 h-8 text-cyan-400" />
        </div>
        <div className="text-center">
          <p className="text-white/80 font-medium">Tap to add photos</p>
          <p className="text-white/40 text-sm mt-1">Up to 20 items · any format</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Previews grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence>
            {files.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden bg-slate-800"
              >
                <img src={f.preview} alt="item" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFile(f.id)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-900/80 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Progress bar when processing */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              Analyzing item {progress.current} of {progress.total}...
            </span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Analyze button */}
      {files.length > 0 && !isProcessing && (
        <Button
          onClick={handleAnalyze}
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl"
        >
          <Zap className="w-5 h-5 mr-2" />
          Evaluate {files.length} Item{files.length > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}