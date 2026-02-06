import React from 'react';
import { motion } from 'framer-motion';

export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, info) => {
        if (info.offset.y > 150) {
          handleRefresh();
        }
      }}
      className="relative"
    >
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-slate-700 border-t-cyan-400 rounded-full"
          />
        </motion.div>
      )}
      {children}
    </motion.div>
  );
}