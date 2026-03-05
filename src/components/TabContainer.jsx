import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from '@/pages/Home';
import History from '@/pages/History';
import Marketplace from '@/pages/Marketplace';
import Settings from '@/pages/Settings';

const TAB_ORDER = ['/Home', '/History', '/Marketplace', '/Settings'];

const PAGE_COMPONENTS = {
  '/Home': Home,
  '/History': History,
  '/Marketplace': Marketplace,
  '/Settings': Settings,
};

function normalizePath(path) {
  return path === '/' ? '/Home' : path;
}

export default function TabContainer() {
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);

  const directionRef = React.useRef(1);
  const prevPathRef = React.useRef(currentPath);

  if (prevPathRef.current !== currentPath) {
    const prevIndex = TAB_ORDER.indexOf(prevPathRef.current);
    const currentIndex = TAB_ORDER.indexOf(currentPath);
    if (prevIndex !== -1 && currentIndex !== -1) {
      directionRef.current = currentIndex >= prevIndex ? 1 : -1;
    }
    prevPathRef.current = currentPath;
  }

  const direction = directionRef.current;
  const PageComponent = PAGE_COMPONENTS[currentPath] || Home;

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={currentPath}
        initial={{ opacity: 0, x: direction * 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -20 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        style={{ touchAction: 'pan-y' }}
      >
        <PageComponent />
      </motion.div>
    </AnimatePresence>
  );
}