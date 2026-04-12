import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Mail, Shield, FileText, HelpCircle, ChevronDown, ChevronUp, Scan, Search, Star, Bell, Layers, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const FAQ_ITEMS = [
  {
    q: 'How do I scan an item for valuation?',
    a: 'Go to the Home tab and tap the camera icon. Take a photo or upload an image of your item. Our AI will identify it and provide a market value estimate within seconds.',
  },
  {
    q: 'How accurate are the valuations?',
    a: 'Valuations are AI-generated estimates based on recent market data, historical sales, and comparable listings. They are a guide — always check live listings for the most current prices.',
  },
  {
    q: 'What is the Collectibles Appraisal tool?',
    a: 'The Collectibles tab on the Home screen is optimised for coins, stamps, trading cards, comics, and antiques. Upload front and back images for a detailed grading estimate, rarity score, and historical sales data.',
  },
  {
    q: 'How does the Watchlist work?',
    a: 'Add any evaluated item to your Watchlist. We automatically check prices periodically and send you an email alert when the market value changes by more than your set threshold (default 10%).',
  },
  {
    q: 'What is a Credit Pack?',
    a: 'Free users get a limited number of evaluations per month. Credit Packs give you additional evaluations. One credit = one AI evaluation. Premium subscribers get unlimited evaluations.',
  },
  {
    q: 'How do I add items to a Portfolio Collection?',
    a: 'Go to the Portfolio tab, create a collection, then add evaluated items to it. Collections show a total estimated value so you can track your overall holdings.',
  },
  {
    q: 'Can I export my valuation history?',
    a: 'Yes — go to the History tab and tap the export icon to download your history as a CSV or PDF.',
  },
  {
    q: 'How do I cancel my Premium subscription?',
    a: 'Subscriptions are managed through our website. Go to Settings, tap "Manage Subscription", or contact us at support@pricelensai.com and we will cancel it for you. Your Premium access continues until the end of the billing period.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings → scroll to Danger Zone → tap "Delete Account". This permanently removes all your data and cannot be undone.',
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-700/50 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-3"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm text-white font-medium">{item.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-slate-400 text-sm pb-4 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppInfo() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-4">
        <Link to="/Landing" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* About */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Pricelens AI</h2>
              <p className="text-slate-400 text-xs">Version 1.0</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Pricelens AI is an AI-powered valuation tool for everyday items and collectibles. Snap a photo or search by keyword to instantly get market price estimates, condition assessments, and buying/selling recommendations — all powered by real market data and advanced AI.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { icon: Scan, label: 'AI Image Scanning' },
              { icon: Search, label: 'Keyword Search' },
              { icon: Star, label: 'Collectibles Grading' },
              { icon: Bell, label: 'Price Alerts' },
              { icon: Layers, label: 'Portfolio Tracking' },
              { icon: ShoppingBag, label: 'Marketplace Listings' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h2 className="text-white font-semibold">Contact & Support</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-slate-400 text-xs mb-1">Email Support</div>
              <a href="mailto:support@pricelensai.com" className="text-cyan-400 hover:text-cyan-300">
                support@pricelensai.com
              </a>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Support Hours</div>
              <div className="text-slate-300">Monday – Friday, 9am – 5pm AEST</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Website</div>
              <a href="https://pricelensai.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                pricelensai.com
              </a>
            </div>
          </div>
        </div>

        {/* Terms & Legal */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-white font-semibold">Terms & Legal</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              By using Pricelens AI, you agree to our Terms of Use. Our service provides price estimates for informational purposes only. Valuations are AI-generated and should not be relied upon as professional appraisals.
            </p>
            <p>
              We are not responsible for any financial decisions made based on the information provided. Always verify valuations with a qualified professional for high-value items.
            </p>
            <button
              onClick={() => navigate('/PrivacyPolicy')}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mt-2"
            >
              <Shield className="w-4 h-4" />
              View Privacy Policy
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-white font-semibold">FAQ & How-To Guide</h2>
          </div>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} item={item} />
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}