import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Zap, Sparkles, Tag, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function CameraCapture({ onCapture, isProcessing }) {
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identified, setIdentified] = useState(null); // { item_name, category, estimated_value_low, estimated_value_high }

  const handleFileSelected = (file) => {
    if (!file) return;
    setIdentified(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCameraChange = (e) => handleFileSelected(e.target.files?.[0]);
  const handleUploadChange = (e) => handleFileSelected(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFileSelected(file);
  };

  const handleIdentify = async () => {
    if (!selectedFile) return;
    setIsIdentifying(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Look at this image and quickly identify the item. Return just the basic identification — do not do deep market research yet.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          item_name: { type: 'string' },
          category: { type: 'string' },
          estimated_value_low: { type: 'number' },
          estimated_value_high: { type: 'number' },
        }
      }
    });
    setIdentified({ ...result, _file_url: file_url });
    setIsIdentifying(false);
  };

  const handleAnalyze = () => {
    if (selectedFile) onCapture(selectedFile);
  };

  const clearPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    setIdentified(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative">
      {/* Hidden inputs */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraChange} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadChange} className="hidden" />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="capture"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 transition-colors"
            >
              <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-cyan-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-cyan-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-cyan-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-cyan-400 rounded-br-lg" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-5 rounded-full bg-cyan-500/10 border border-cyan-400/30"
                >
                  <Camera className="w-10 h-10 text-cyan-400" />
                </motion.div>
                <p className="text-white/80 font-medium mt-2">Drop an image here</p>
                <p className="text-white/40 text-xs">or choose an option below</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                onClick={() => cameraInputRef.current?.click()}
                variant="outline"
                className="h-12 gap-2 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50"
              >
                <Camera className="w-4 h-4" /> Take Photo
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="h-12 gap-2 bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                <Upload className="w-4 h-4" /> Upload Photo
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Image preview */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40" />
              <button onClick={clearPreview} className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/60 backdrop-blur-sm text-white">
                <X className="w-5 h-5" />
              </button>
              {(isProcessing || isIdentifying) && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                />
              )}
            </div>

            {/* AI identification preview */}
            <AnimatePresence>
              {isIdentifying && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="mt-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-slate-600 border-t-cyan-400 rounded-full flex-shrink-0" />
                  <p className="text-slate-400 text-sm">AI is identifying your item…</p>
                </motion.div>
              )}

              {identified && !isIdentifying && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 bg-slate-800/60 border border-cyan-500/30 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">AI Identified</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Item</p>
                      <p className="text-sm font-medium text-white">{identified.item_name}</p>
                    </div>
                  </div>
                  {identified.category && (
                    <div className="flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Category</p>
                        <p className="text-sm text-white">{identified.category}</p>
                      </div>
                    </div>
                  )}
                  {identified.estimated_value_low != null && (
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Est. Value</p>
                        <p className="text-sm font-semibold text-emerald-400">
                          ${identified.estimated_value_low?.toLocaleString()} – ${identified.estimated_value_high?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {!identified && !isIdentifying && (
                <Button
                  onClick={handleIdentify}
                  disabled={isProcessing}
                  variant="outline"
                  className="h-12 gap-2 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50"
                >
                  <Sparkles className="w-4 h-4" /> Quick ID
                </Button>
              )}
              <Button
                onClick={handleAnalyze}
                disabled={isProcessing || isIdentifying}
                className={`h-12 gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl ${!identified && !isIdentifying ? '' : 'col-span-2'}`}
              >
                {isProcessing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    Analyzing…
                  </>
                ) : (
                  <><Zap className="w-5 h-5" /> {identified ? 'Full Evaluation' : 'Evaluate Price'}</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}