import React, { useRef, useState } from 'react';
import { Camera, X, Zap, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollectiblesCapture({ onCapture, isProcessing }) {
  const fileInputRef = useRef(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [currentSide, setCurrentSide] = useState('front');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (currentSide === 'front') {
          setFrontImage({ preview: reader.result, file });
        } else {
          setBackImage({ preview: reader.result, file });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (side) => {
    setCurrentSide(side);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleAnalyze = () => {
    if (frontImage?.file) {
      onCapture(frontImage.file, backImage?.file || null);
    }
  };

  const clearImages = () => {
    setFrontImage(null);
    setBackImage(null);
    setCurrentSide('front');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasBothImages = frontImage && backImage;
  const hasAnyImage = frontImage || backImage;

  return (
    <div className="relative space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Instructions */}
      <div className="text-center text-sm text-slate-400 mb-2">
        <p>Capture front and back for better identification</p>
        <p className="text-xs text-amber-400 mt-1">Ideal for coins, cards, stamps & collectibles</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Front Image */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">FRONT</span>
          <AnimatePresence mode="wait">
            {!frontImage ? (
              <motion.div
                key="front-capture"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handleCapture('front')}
                className="aspect-square bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl cursor-pointer relative group border-2 border-dashed border-slate-700 hover:border-amber-500/50 transition-colors"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <p className="mt-2 text-slate-500 text-xs">Tap to capture</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="front-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-xl overflow-hidden relative border-2 border-emerald-500/50"
              >
                <img src={frontImage.preview} alt="Front" className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1 p-1 rounded-full bg-emerald-500">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <button
                  onClick={() => setFrontImage(null)}
                  className="absolute bottom-1 right-1 p-1.5 rounded-full bg-slate-900/80 text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back Image */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">BACK <span className="text-slate-600">(optional)</span></span>
          <AnimatePresence mode="wait">
            {!backImage ? (
              <motion.div
                key="back-capture"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handleCapture('back')}
                className="aspect-square bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl cursor-pointer relative group border-2 border-dashed border-slate-700 hover:border-amber-500/50 transition-colors"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <p className="mt-2 text-slate-500 text-xs">Tap to capture</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-xl overflow-hidden relative border-2 border-emerald-500/50"
              >
                <img src={backImage.preview} alt="Back" className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1 p-1 rounded-full bg-emerald-500">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <button
                  onClick={() => setBackImage(null)}
                  className="absolute bottom-1 right-1 p-1.5 rounded-full bg-slate-900/80 text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scanning Animation */}
      {isProcessing && hasAnyImage && (
        <motion.div
          initial={{ top: 0 }}
          animate={{ top: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none"
        />
      )}

      {/* Action Buttons */}
      {hasAnyImage && (
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={clearImages}
            className="flex-1 border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={!frontImage || isProcessing}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Identifying...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Identify {hasBothImages ? 'Both Sides' : 'Item'}
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}