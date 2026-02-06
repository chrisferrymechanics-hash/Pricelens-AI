import React, { useRef, useState } from 'react';
import { Camera, X, Zap, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollectiblesCapture({ onCapture, isProcessing }) {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const maxImages = 6;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && images.length < maxImages) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([...images, { preview: reader.result, file }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = () => {
    if (images.length > 0) {
      const files = images.map(img => img.file);
      onCapture(files);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
        <p>Upload up to {maxImages} images for comprehensive analysis</p>
        <p className="text-xs text-amber-400 mt-1">Multiple angles help identify grading & authenticity</p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-xl overflow-hidden relative border-2 border-emerald-500/50"
          >
            <img src={image.preview} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-xs font-medium">
              {index + 1}
            </div>
            <button
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-500/90 text-white hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}

        {/* Add Image Button */}
        {images.length < maxImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleAddImage}
            className="aspect-square bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl cursor-pointer relative group border-2 border-dashed border-slate-700 hover:border-amber-500/50 transition-colors"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors mb-1" />
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              <p className="mt-1 text-slate-500 text-xs">Add photo</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scanning Animation */}
      {isProcessing && images.length > 0 && (
        <motion.div
          initial={{ top: 0 }}
          animate={{ top: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none"
        />
      )}

      {/* Action Buttons */}
      {images.length > 0 && (
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={clearImages}
            className="flex-1 border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Analyze {images.length} {images.length === 1 ? 'Image' : 'Images'}
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}