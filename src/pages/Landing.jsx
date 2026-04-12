import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Star, TrendingUp, Camera, Bookmark, ShieldCheck, ChevronRight, Layers, DollarSign, BarChart2, Tag, ArrowRightLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Camera,
    title: 'Instant Photo Valuation',
    description: 'Point your camera at anything — a vintage watch, a trading card, a piece of furniture — and our AI identifies it, checks live market data, and returns a real-world price range in seconds. No guesswork, no manual searching.'
  },
  {
    icon: Search,
    title: 'Keyword Market Search',
    description: 'Already know what you have? Search by name, model, or description and instantly pull comparable sales, price trends and platform-by-platform breakdowns across eBay, Etsy, Amazon and more.'
  },
  {
    icon: Star,
    title: 'Collectibles Grading & Authentication',
    description: 'Purpose-built for serious collectors. Upload front and back images of coins, stamps, trading cards, comics, or antiques and receive estimated grades from PSA, BGS, CGC and PCGS — plus authenticity confidence scores to help you avoid fakes before you buy.'
  },
  {
    icon: ShieldCheck,
    title: 'Authenticity Intelligence',
    description: 'Every evaluation includes an AI-generated authenticity assessment. Known forgery patterns, unusual wear, suspect printing or inconsistent markings are all flagged — giving you a data-backed confidence score before money changes hands.'
  },
  {
    icon: Layers,
    title: 'Portfolio & Collections',
    description: 'Organise everything you own into collections — sports cards, vinyl records, antiques, sneakers — whatever you flip or collect. See your total portfolio value at a glance, track how individual items move, and know exactly what your holdings are worth right now.'
  },
  {
    icon: Bookmark,
    title: 'Watchlist & Price Alerts',
    description: 'Add any item to your Watchlist and set a price-move threshold. When the market shifts — up or down — you get an alert. Perfect for timing a sell, spotting a dip to buy, or staying ahead of trends in fast-moving categories like Pokémon cards or limited sneakers.'
  },
  {
    icon: ArrowRightLeft,
    title: 'Buy Low, Sell Smart',
    description: 'The Deal Scanner continuously monitors marketplaces for listings priced below market value on items you care about. When a bargain surfaces, it lands in your Buy Opportunities feed so you can act fast and flip for profit.'
  },
  {
    icon: Tag,
    title: 'Marketplace Listing Tools',
    description: 'Once you know what something is worth, list it directly from PriceLens AI. Generate optimised titles, descriptions and suggested prices for eBay and beyond — all pre-filled from your evaluation so you can go from appraisal to listing in minutes.'
  },
  {
    icon: BarChart2,
    title: 'Historical Sales & Trends',
    description: "Every item evaluation includes a historical sales log — real transactions, real dates, real prices. See how the market has moved over time and use that data to decide when to hold and when to sell."
  }
];

const howItWorks = [
  { step: '01', title: 'Scan or Search', desc: 'Photograph your item or search by keyword. PriceLens AI pulls identity, condition and live market comps instantly.' },
  { step: '02', title: 'Grade & Verify', desc: 'For collectibles, get professional-grade estimates and an authenticity report — before you commit to a buy or price a sell.' },
  { step: '03', title: 'Track Your Portfolio', desc: 'Every evaluated item lives in your digital inventory. Collections, watchlists and value snapshots give you a living record of what you own.' },
  { step: '04', title: 'Flip with Confidence', desc: 'Deal alerts surface underpriced listings. Marketplace tools help you list fast. Your portfolio updates as you buy and sell — a true digital wallet for real things.' },
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

      {/* Digital Wallet Concept */}
      <section className="px-6 pb-16 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20 rounded-3xl p-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-5">
            A Digital Wallet for{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Real Things</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-4">
            Most people have no idea what their stuff is worth. A box of inherited coins, a collection of comics in the attic, a sneaker haul from years ago — real value, sitting unrecognised.
          </p>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mb-4">
            PriceLens AI turns your physical items into a managed, valued inventory — the same way a bank account tracks your cash. Snap it, identify it, value it, track it. Buy underpriced. Sell at the right moment. Know your net worth in things, not just numbers.
          </p>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            Whether you're a weekend flipper scoring deals at garage sales, a serious collector building a graded card portfolio, or someone who just wants to know what their valuables are actually worth — PriceLens AI is the tool that connects every step: identify → grade → authenticate → track → deal → list → sell.
          </p>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          How It All Connects
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {howItWorks.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 relative"
            >
              <div className="text-4xl font-black text-cyan-500/20 mb-3">{step.step}</div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-4"
        >
          Every Tool You Need
        </motion.h2>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">From first scan to final sale — every feature is built to help you value smarter, collect confidently, and flip profitably.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
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
          <h2 className="text-3xl font-bold mb-4">Your items have value.<br/>It's time to know it.</h2>
          <p className="text-slate-400 mb-8">Join collectors, resellers and bargain hunters who use PriceLens AI as their digital wallet for real things.</p>
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