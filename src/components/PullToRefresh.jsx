import React from 'react';
import { motion } from 'framer-motion';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const startYRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const THRESHOLD = 80;

  const handleTouchStart = (e) => {
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startYRef.current === null || isRefreshing) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.4, THRESHOLD));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(0);
      await onRefresh();
      setIsRefreshing(false);
    } else {
      setPullDistance(0);
    }
    startYRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {(isRefreshing || pullDistance > 10) && (
        <div
          className="flex justify-center overflow-hidden transition-all"
          style={{ height: isRefreshing ? 32 : pullDistance }}
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }}
            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
            className="w-6 h-6 border-2 border-slate-700 border-t-cyan-400 rounded-full mt-1"
          />
        </div>
      )}
      {children}
    </div>
  );
}