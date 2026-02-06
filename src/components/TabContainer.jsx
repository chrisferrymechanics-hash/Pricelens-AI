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

export default function TabContainer() {
  const location = useLocation();
  const [mountedPages, setMountedPages] = React.useState(new Set([location.pathname]));
  const prevPathRef = React.useRef(location.pathname);
  
  // Tab order for direction detection
  const tabOrder = ['/', '/Home', '/History', '/Marketplace', '/Settings'];
  
  // Determine navigation direction
  const getDirection = () => {
    const prevIndex = tabOrder.indexOf(prevPathRef.current);
    const currentIndex = tabOrder.indexOf(location.pathname);
    return currentIndex > prevIndex ? 1 : -1; // 1 = forward, -1 = backward
  };
  
  const direction = getDirection();
  
  // Mount new pages but never unmount
  React.useEffect(() => {
    setMountedPages(prev => new Set([...prev, location.pathname]));
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <>
      {Array.from(mountedPages).map((path) => {
        const PageComponent = PAGE_COMPONENTS[path];
        if (!PageComponent) return null;
        
        const isActive = location.pathname === path;
        
        return (
          <div
            key={path}
            style={{
              display: isActive ? 'block' : 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <PageComponent />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}