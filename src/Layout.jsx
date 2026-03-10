import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Clock, Settings, Store, Bookmark, Layers, ArrowLeft } from 'lucide-react';
import TabContainer from '@/components/TabContainer';

const TAB_PATHS = new Set(['/', '/Home', '/History', '/Marketplace', '/Watchlist', '/Portfolio', '/Settings']);

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // Load and apply saved theme preference
    const saved = localStorage.getItem('theme-mode') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    document.documentElement.style.colorScheme = saved;
  }, []);

  React.useEffect(() => {
    // Listen for theme changes from other tabs/Settings
    const handleStorageChange = () => {
      const saved = localStorage.getItem('theme-mode') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
      document.documentElement.style.colorScheme = saved;
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const isTabRoute = TAB_PATHS.has(location.pathname);
  
  const navItems = [
    { name: 'Home', icon: Home, path: createPageUrl('Home') },
    { name: 'History', icon: Clock, path: createPageUrl('History') },
    { name: 'Watchlist', icon: Bookmark, path: createPageUrl('Watchlist') },
    { name: 'Portfolio', icon: Layers, path: createPageUrl('Portfolio') },
    { name: 'Marketplace', icon: Store, path: createPageUrl('Marketplace') },
    { name: 'Settings', icon: Settings, path: createPageUrl('Settings') }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Main content with bottom padding for nav (64px nav + safe area) */}
      <div style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        {isTabRoute ? <TabContainer /> : children}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--background))] dark:bg-slate-900/95 backdrop-blur-lg border-t dark:border-slate-800 border-slate-200 select-none" style={{ touchAction: 'none' }}>
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
                  onClick={() => {
                    try {
                      if ('vibrate' in navigator) {
                        navigator.vibrate(10);
                      }
                    } catch (e) {
                      // Haptics not supported or disabled (e.g., iOS Safari)
                    }
                  }}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    active 
                      ? 'text-cyan-300 bg-cyan-500/15' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`} />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

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
          :root:not([data-theme]) {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
          }
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme]) {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
          }
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