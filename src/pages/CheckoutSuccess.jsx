import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 6;

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  // confirming → confirmed (Stripe says paid) | pending (couldn't confirm yet)
  const [status, setStatus] = useState('confirming');
  const [countdown, setCountdown] = useState(4);
  const cancelled = useRef(false);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    const check = async () => {
      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        try {
          if (sessionId) {
            const res = await base44.functions.invoke('verifyCheckout', { sessionId });
            if (res.data?.paid) return 'confirmed';
          } else {
            const me = await base44.auth.me();
            if (me?.plan_type === 'premium' || (me?.credits || 0) > 0) return 'confirmed';
          }
        } catch (err) {
          console.error('Payment confirmation check failed:', err);
        }
        if (cancelled.current) return null;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        if (cancelled.current) return null;
      }
      return 'pending';
    };

    check().then((outcome) => {
      if (outcome) setStatus(outcome);
    });

    return () => {
      cancelled.current = true;
    };
  }, []);

  useEffect(() => {
    if (status !== 'confirmed') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/Home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            status === 'confirmed' ? 'bg-emerald-500/20' : 'bg-cyan-500/20'
          }`}
        >
          {status === 'confirming' ? (
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          ) : status === 'confirmed' ? (
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          ) : (
            <Clock className="w-10 h-10 text-cyan-400" />
          )}
        </motion.div>

        {status === 'confirmed' ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
            <p className="text-slate-400 mb-6">
              Your account has been upgraded. Redirecting you to the home screen in {countdown} seconds...
            </p>
          </>
        ) : status === 'pending' ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-3">Payment received</h1>
            <p className="text-slate-400 mb-6">
              We could not confirm it just yet. Your access activates as soon as Stripe finishes processing — usually within a minute. If it does not appear, contact support with your receipt.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-3">Confirming your payment</h1>
            <p className="text-slate-400 mb-6">Hang tight — this only takes a moment.</p>
          </>
        )}

        <Button
          onClick={() => navigate('/Home')}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          Go to Home Now
        </Button>
      </motion.div>
    </div>
  );
}