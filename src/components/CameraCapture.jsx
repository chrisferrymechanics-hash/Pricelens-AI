import React, { useRef, useState } from 'react';
import { Camera, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CameraCapture({ onCapture, isProcessing }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (fileInputRef.current?.files?.[0]) {
      onCapture(fileInputRef.current.files[0]);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="capture"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer relative group"
            >
              {/* Corner Brackets */}
              <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-cyan-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-cyan-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-cyan-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-cyan-400 rounded-br-lg" />

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-5 rounded-full bg-cyan-500/10 border border-cyan-400/30"
                >
                  <Camera className="w-10 h-10 text-cyan-400" />
                </motion.div>
                <p className="mt-4 text-white/80 font-medium">Tap to capture</p>
                <p className="mt-1 text-white/50 text-sm">Take a photo of any item</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40" />
              
              <button
                onClick={clearPreview}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/60 backdrop-blur-sm text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {isProcessing && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                />
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="w-full mt-4 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Evaluate Price
                </div>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}