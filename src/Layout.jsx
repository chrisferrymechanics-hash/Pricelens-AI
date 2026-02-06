import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Clock, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  // Store scroll positions for each page
  const scrollPositions = React.useRef({});
  
  // Save scroll position before navigation
  React.useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current[location.pathname] = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);
  
  // Restore scroll position after navigation
  React.useEffect(() => {
    const savedPosition = scrollPositions.current[location.pathname];
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
  
  const navItems = [
    { name: 'Home', icon: Home, path: createPageUrl('Home') },
    { name: 'History', icon: Clock, path: createPageUrl('History') },
    { name: 'Settings', icon: Settings, path: createPageUrl('Settings') }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Safe area top */}
      <div className="h-[env(safe-area-inset-top)]" />
      
      {/* Main content with bottom padding for nav */}
      <div className="pb-20">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 select-none">
        {/* Safe area bottom padding */}
        <div className="pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    active 
                      ? 'text-cyan-400 bg-cyan-500/10' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''}`} />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <style>{`
        body {
          overscroll-behavior-y: none;
          -webkit-overflow-scrolling: touch;
        }
        
        @supports(padding: max(0px)) {
          body {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        /* Disable text selection on interactive elements */
        button, a, nav, [role="button"], [role="tab"] {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        /* Allow selection only in content areas */
        input, textarea, [contenteditable="true"] {
          user-select: text;
          -webkit-user-select: text;
        }
      `}</style>
    </div>
  );
}