import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Trash2, AlertTriangle, Crown, CreditCard, Moon, Sun } from 'lucide-react';
import SubscriptionsManager from '@/components/SubscriptionsManager';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser);
    
    // Load theme preference
    const saved = localStorage.getItem('theme-mode');
    if (saved) {
      setDarkMode(saved === 'dark');
      document.documentElement.style.colorScheme = saved;
    }
  }, []);

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const mode = newMode ? 'dark' : 'light';
    localStorage.setItem('theme-mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await base44.functions.invoke('deleteAccount');
      await base44.auth.logout();
    } catch (error) {
      alert('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Theme Toggle */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-slate-400" />
              ) : (
                <Sun className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <div className="text-sm font-medium text-white">Theme</div>
                <div className="text-xs text-slate-400">{darkMode ? 'Dark' : 'Light'}</div>
              </div>
            </div>
            <button
              onClick={handleThemeToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                darkMode ? 'bg-cyan-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.full_name}</h2>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>
          
          {/* Plan Info */}
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Current Plan</div>
                <div className="flex items-center gap-2">
                  {user.plan_type === 'premium' ? (
                    <>
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">Premium</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white font-medium">Free</span>
                      {user.credits > 0 && (
                        <>
                          <span className="text-slate-500">•</span>
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">{user.credits} credits</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              {user.plan_type !== 'premium' && (
                <Button
                  onClick={() => navigate(createPageUrl('Pricing'))}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Deal Alerts */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <SubscriptionsManager />
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
          </div>
          
          {!showDeleteConfirm ? (
            <div>
              <p className="text-slate-400 text-sm mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-red-400 font-medium mb-4">
                Are you absolutely sure? This will permanently delete your account, all evaluations, and cannot be recovered.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Yes, Delete Forever
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  disabled={isDeleting}
                  className="border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}