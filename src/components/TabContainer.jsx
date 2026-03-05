import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from '@/pages/Home';
import History from '@/pages/History';
import Marketplace from '@/pages/Marketplace';
import Settings from '@/pages/Settings';

const PAGE_COMPONENTS = {
  '/': Home,
  '/Home': Home,
  '/History': History,
  '/Marketplace': Marketplace,
  '/Settings': Settings,
};

// Normalize path so / and /Home are treated as the same tab
function normalizePath(path) {
  return path === '/' ? '/Home' : path;
}

const TAB_ORDER = ['/Home', '/History', '/Marketplace', '/Settings'];

export default function TabContainer() {
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);

  const [mountedPages, setMountedPages] = React.useState(new Set([currentPath]));
  const [direction, setDirection] = React.useState(1);
  const prevPathRef = React.useRef(currentPath);

  React.useEffect(() => {
    const prevIndex = TAB_ORDER.indexOf(prevPathRef.current);
    const currentIndex = TAB_ORDER.indexOf(currentPath);
    if (prevIndex !== -1 && currentIndex !== -1) {
      setDirection(currentIndex >= prevIndex ? 1 : -1);
    }
    setMountedPages(prev => new Set([...prev, currentPath]));
    prevPathRef.current = currentPath;
  }, [currentPath]);

  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          style={{ touchAction: 'pan-y', userSelect: 'none' }}
        >
          {Array.from(mountedPages).map((path) => {
            const PageComponent = PAGE_COMPONENTS[path];
            if (!PageComponent) return null;
            const isActive = path === currentPath;
            return (
              <div key={path} style={{ display: isActive ? 'block' : 'none' }}>
                <PageComponent />
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}