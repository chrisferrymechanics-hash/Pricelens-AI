import React, { createContext, useContext, useCallback, useRef, useState, useEffect, useImperativeHandle } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from '@/pages/Home';
import History from '@/pages/History';
import Marketplace from '@/pages/Marketplace';
import Watchlist from '@/pages/Watchlist';
import Portfolio from '@/pages/Portfolio';
import Settings from '@/pages/Settings';

// ─── Tab Navigation Context ──────────────────────────────────────────────────
// Exposed so child pages can push sub-pages or pop back within the same tab.

const TabNavContext = createContext(null);

export function useTabNav() {
  return useContext(TabNavContext);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_ORDER = ['/Home', '/History', '/Watchlist', '/Portfolio', '/Marketplace', '/Settings'];

const ROOT_COMPONENTS = {
  '/Home': Home,
  '/History': History,
  '/Marketplace': Marketplace,
  '/Watchlist': Watchlist,
  '/Portfolio': Portfolio,
  '/Settings': Settings,
};

function normalizePath(path) {
  return path === '/' ? '/Home' : path;
}

// ─── Individual Tab Stack ─────────────────────────────────────────────────────

function TabStack({ tabPath, isActive, onResetScroll }) {
  // stack = array of { Component, props, key }
  const [stack, setStack] = useState([{ Component: ROOT_COMPONENTS[tabPath], props: {}, key: tabPath }]);
  const scrollRef = useRef(null);

  const push = useCallback((Component, props = {}) => {
    try { if ('vibrate' in navigator) navigator.vibrate(10); } catch (_) {}
    setStack(prev => [...prev, { Component, props, key: `${tabPath}-${Date.now()}` }]);
  }, [tabPath]);

  const pop = useCallback(() => {
    try { if ('vibrate' in navigator) navigator.vibrate(10); } catch (_) {}
    setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  const reset = useCallback(() => {
    setStack([{ Component: ROOT_COMPONENTS[tabPath], props: {}, key: tabPath }]);
    // Scroll to top
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tabPath]);

  // Expose reset so Layout can call it when user taps the active tab icon
  useImperativeHandle(onResetScroll, () => ({ reset }), [reset]);

  const currentEntry = stack[stack.length - 1];
  const isAtRoot = stack.length === 1;

  return (
    <TabNavContext.Provider value={{ push, pop, isAtRoot, stack }}>
      <div
        ref={scrollRef}
        style={{
          display: isActive ? 'block' : 'none',
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentEntry.key}
            initial={{ opacity: 0, x: isAtRoot ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAtRoot ? 0 : -24 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ minHeight: '100%' }}
          >
            {/* Sub-page back bar (only when drilled in) */}
            {!isAtRoot && (
              <div className="sticky top-0 z-40 flex items-center px-4 h-12 bg-[hsl(var(--background))]/95 backdrop-blur border-b border-slate-800/50">
                <button
                  onClick={pop}
                  className="absolute left-4 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
                  Back
                </button>
                {currentEntry.props?.title && (
                  <span className="w-full text-center text-sm font-semibold text-white truncate px-16">
                    {currentEntry.props.title}
                  </span>
                )}
              </div>
            )}
            <currentEntry.Component {...currentEntry.props} />
          </motion.div>
        </AnimatePresence>
      </div>
    </TabNavContext.Provider>
  );
}

// ─── TabContainer ─────────────────────────────────────────────────────────────

export default function TabContainer({ activeTab, onTabResetRef }) {
  const location = useLocation();
  const currentTab = activeTab || normalizePath(location.pathname);

  // Keep a ref map so Layout can call reset on the active tab
  const stackRefs = useRef({});

  // Expose an imperative handle so Layout's onTabResetRef can call reset()
  useEffect(() => {
    if (onTabResetRef) {
      onTabResetRef.current = {
        reset: () => stackRefs.current[currentTab]?.reset(),
      };
    }
  }, [currentTab, onTabResetRef]);

  return (
    <div style={{ height: '100%' }}>
      {TAB_ORDER.map(tabPath => {
        const resetHandle = { current: null };
        stackRefs.current[tabPath] = {
          reset: () => resetHandle.current?.reset(),
        };
        return (
          <TabStack
            key={tabPath}
            tabPath={tabPath}
            isActive={tabPath === currentTab}
            onResetScroll={resetHandle}
          />
        );
      })}
    </div>
  );
}