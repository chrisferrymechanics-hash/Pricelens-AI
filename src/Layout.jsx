import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Clock, Settings, Store, Bookmark, Layers, ArrowLeft } from 'lucide-react';
import TabContainer from '@/components/TabContainer';

const TAB_PATHS = new Set(['/', '/Home', '/History', '/Marketplace', '/Watchlist', '/Portfolio', '/Settings']);

function normalizePath(path) {
  return path === '/' ? '/Home' : path;
}

const NAV_ITEMS = [
  { name: 'Home',        icon: Home,     path: '/Home' },
  { name: 'History',     icon: Clock,    path: '/History' },
  { name: 'Watchlist',   icon: Bookmark, path: '/Watchlist' },
  { name: 'Portfolio',   icon: Layers,   path: '/Portfolio' },
  { name: 'Marketplace', icon: Store,    path: '/Marketplace' },
  { name: 'Settings',    icon: Settings, path: '/Settings' },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab is owned entirely by Layout — no URL changes when switching tabs
  const [activeTab, setActiveTab] = useState(() => normalizePath(location.pathname));

  // Ref passed to TabContainer so we can call reset() on the active tab stack
  const tabResetRef = useRef(null);

  // Theme bootstrap
  useEffect(() => {
    const apply = () => {
      const saved = localStorage.getItem('theme-mode') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
      document.documentElement.style.colorScheme = saved;
    };
    apply();
    window.addEventListener('storage', apply);
    return () => window.removeEventListener('storage', apply);
  }, []);

  // If the router navigates to a tab URL (e.g. deep link), sync active tab
  useEffect(() => {
    const normalized = normalizePath(location.pathname);
    if (TAB_PATHS.has(location.pathname) && normalized !== activeTab) {
      setActiveTab(normalized);
    }
  }, [location.pathname]);

  const isTabRoute = TAB_PATHS.has(location.pathname);

  const handleTabPress = (tabPath) => {
    try { if ('vibrate' in navigator) navigator.vibrate(10); } catch (_) {}

    if (tabPath === activeTab) {
      // Already on this tab → reset stack to root and scroll to top
      tabResetRef.current?.reset();
    } else {
      setActiveTab(tabPath);
      // Keep URL in sync (replace so we never pollute back stack)
      navigate(tabPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Main content */}
      {isTabRoute ? (
        <div style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))', height: '100%' }}>
          <TabContainer activeTab={activeTab} onTabResetRef={tabResetRef} />
        </div>
      ) : (
        <>
          {/* iOS-style back bar for non-tab pages (Pricing, CheckoutSuccess, etc.) */}
          <div className="sticky top-0 z-40 flex items-center justify-center px-4 pt-[env(safe-area-inset-top)] h-12 bg-[hsl(var(--background))]/95 backdrop-blur border-b border-slate-800/50">
            <button
              onClick={() => { try { if ('vibrate' in navigator) navigator.vibrate(10); } catch (_) {} navigate(-1); }}
              className="absolute left-4 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-sm font-semibold text-white">{currentPageName}</span>
          </div>
          {children}
        </>
      )}

      {/* Bottom tab bar — only on tab routes */}
      {isTabRoute && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--background))]/95 backdrop-blur-lg border-t border-slate-800/70 select-none"
          style={{ touchAction: 'none' }}
        >
          <div className="pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around px-2 py-2">
              {NAV_ITEMS.map(({ name, icon: Icon, path }) => {
                const active = activeTab === path;
                return (
                  <button
                    key={name}
                    onClick={() => handleTabPress(path)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 ${
                      active
                        ? 'text-cyan-300 bg-cyan-500/15'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 transition-transform duration-150 ${active ? 'scale-110' : ''}`} />
                    <span className="text-[10px] font-medium">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      <style>{`
        :root {
          color-scheme: light dark;
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
        }
        :root[data-theme="light"] {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          color-scheme: light;
        }
        :root[data-theme="dark"] {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          color-scheme: dark;
        }
        @media (prefers-color-scheme: light) {
          :root:not([data-theme]) { --background: 0 0% 100%; --foreground: 222.2 84% 4.9%; }
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme]) { --background: 222.2 84% 4.9%; --foreground: 210 40% 98%; }
        }
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
        button, a, nav, [role="button"], [role="tab"] {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        input, textarea, [contenteditable="true"] {
          user-select: text;
          -webkit-user-select: text;
        }
      `}</style>
    </div>
  );
}