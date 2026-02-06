import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Clock, Settings, Store } from 'lucide-react';
import TabContainer from '@/components/TabContainer';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const isTabRoute = ['/', '/Home', '/History', '/Marketplace', '/Settings'].includes(location.pathname);
  
  const navItems = [
    { name: 'Home', icon: Home, path: createPageUrl('Home') },
    { name: 'History', icon: Clock, path: createPageUrl('History') },
    { name: 'Marketplace', icon: Store, path: createPageUrl('Marketplace') },
    { name: 'Settings', icon: Settings, path: createPageUrl('Settings') }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Safe area top */}
      <div className="h-[env(safe-area-inset-top)]" />
      
      {/* Main content with bottom padding for nav (64px nav + safe area) */}
      <div style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        {isTabRoute ? <TabContainer /> : children}
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
        :root {
          color-scheme: light dark;
        }

        @media (prefers-color-scheme: light) {
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
          }
        }

        @media (prefers-color-scheme: dark) {
          :root {
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