import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Star, TrendingUp, Camera, Bookmark, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Camera,
    title: 'Photo Identification',
    description: 'Snap a photo and our AI instantly identifies your item and estimates its market value.'
  },
  {
    icon: Search,
    title: 'Keyword Search',
    description: 'Search any item by name or description to get real-time pricing from multiple sources.'
  },
  {
    icon: Star,
    title: 'Collectibles Appraisal',
    description: 'Specialised grading and authentication for coins, stamps, trading cards, comics and more.'
  },
  {
    icon: TrendingUp,
    title: 'Portfolio Tracking',
    description: 'Organise your collection and track total value over time with smart portfolio tools.'
  },
  {
    icon: Bookmark,
    title: 'Watchlist & Alerts',
    description: 'Monitor items and get notified when prices move so you never miss a deal.'
  },
  {
    icon: ShieldCheck,
    title: 'Authenticity Check',
    description: 'AI-powered confidence scores help you spot fakes before you buy or sell.'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-white">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">AI-Powered Price Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Know What Your<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Items Are Worth
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            PriceLens AI analyses photos and keywords to deliver instant, accurate valuations for everyday items, collectibles, antiques and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/Home">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-base h-auto">
                Get Started Free <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/Pricing">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white px-8 py-3 text-base h-auto">
                View Plans
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Everything You Need to Value Smarter
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-10"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-400 mb-8">Join thousands of collectors, resellers and bargain hunters using PriceLens AI.</p>
          <Link to="/Home">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-10 py-3 text-base h-auto">
              Start for Free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-slate-500 text-sm">
        <p className="mb-3 font-semibold text-slate-400">PriceLens AI</p>
        <div className="flex justify-center gap-6">
          <Link to="/PrivacyPolicy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
          <Link to="/AppInfo" className="hover:text-cyan-400 transition-colors">App Info & FAQ</Link>
          <Link to="/Pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
        </div>
        <p className="mt-4 text-xs text-slate-600">© {new Date().getFullYear()} PriceLens AI. All rights reserved.</p>
      </footer>
    </div>
  );
}