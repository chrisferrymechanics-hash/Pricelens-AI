import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const plans = [
  {
    name: 'Free',
    price: '$0',
    priceId: null,
    description: 'Get started with basic features',
    features: [
      '5 evaluations per month',
      'Basic price analysis',
      'Camera & keyword search',
      'Community support'
    ],
    buttonText: 'Free',
    buttonVariant: 'outline',
    isFree: true
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    priceId: 'price_1Sy3wNIG0oshJ31B9nAoGQiJ',
    description: 'Unlimited evaluations for power users',
    features: [
      'Unlimited evaluations',
      'Advanced AI analysis',
      'Collectibles identification',
      'Priority support',
      'Full history access',
      'Export reports'
    ],
    buttonText: 'Upgrade to Premium',
    highlight: true
  },
  {
    name: 'Credit Pack',
    price: '$4.99',
    priceId: 'price_1Sy3wNIG0oshJ31BA58efeTq',
    description: 'Pay as you go with credits',
    features: [
      '10 evaluation credits',
      'Never expires',
      'All features included',
      'Perfect for occasional use'
    ],
    buttonText: 'Buy Credits'
  }
];

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const handleFreePlan = () => {
    navigate(createPageUrl('Home'));
  };

  const handleCheckout = async (priceId, planName, planType) => {
    if (!priceId) return;

    try {
      setLoading(priceId);
      const response = await base44.functions.invoke('createCheckout', { priceId, planType });

      if (response.data.isIframeError) {
        alert('Checkout is not available in preview mode. Please publish your app and open it in a new tab.');
        setLoading(null);
        return;
      }

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="mb-6 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">Simple Pricing</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Choose Your Plan</h1>
            <p className="text-slate-400 text-lg">Get the perfect plan for your needs</p>
          </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                plan.highlight 
                  ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30' 
                  : 'bg-slate-800/50 border border-slate-700/50'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-400">{plan.period}</span>}
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-cyan-400' : 'text-emerald-400'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => plan.isFree ? handleFreePlan() : handleCheckout(plan.priceId, plan.name, plan.name === 'Premium' ? 'premium' : 'credits')}
                disabled={loading === plan.priceId}
                variant={plan.buttonVariant || 'default'}
                className={`w-full ${
                  plan.highlight 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white' 
                    : ''
                }`}
              >
                {loading === plan.priceId ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {plan.highlight && <Zap className="w-4 h-4" />}
                    {plan.buttonText}
                  </div>
                )}
              </Button>
            </motion.div>
          ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center text-slate-400 text-sm">
        <p>All plans include secure payments powered by Stripe</p>
        <p className="mt-2">Test mode: Use card 4242 4242 4242 4242 for testing</p>
      </div>
    </div>
  );
}