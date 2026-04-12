import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-4">
        <Link to="/Landing" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-6">Last updated: March 2026</p>

        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-2">1. Overview</h2>
            <p>
              Pricelens AI ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and services.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Account Information:</strong> Your name and email address when you register.</li>
              <li><strong className="text-white">Images:</strong> Photos you upload for item identification and valuation. These are processed by our AI systems and stored securely.</li>
              <li><strong className="text-white">Search Queries:</strong> Keywords and search terms you enter for price research.</li>
              <li><strong className="text-white">Usage Data:</strong> How you interact with the app, including features used and frequency of use.</li>
              <li><strong className="text-white">Payment Information:</strong> Processed securely by Stripe. We do not store your card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide AI-powered item identification and price evaluation services.</li>
              <li>To personalise your experience and maintain your valuation history.</li>
              <li>To send price alert notifications you have opted into.</li>
              <li>To process subscription payments and manage your account.</li>
              <li>To improve the accuracy and functionality of our AI models.</li>
              <li>To respond to your support requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">4. Data Sharing</h2>
            <p>We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-white">AI Providers:</strong> Images and queries are processed by third-party AI APIs (e.g., Google Gemini, OpenAI) to generate valuations.</li>
              <li><strong className="text-white">Stripe:</strong> For payment processing.</li>
              <li><strong className="text-white">Hosting Providers:</strong> For secure data storage and infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">5. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. You may delete your account at any time from the Settings page, which will permanently remove all your data.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">6. Your Rights</h2>
            <p>Depending on your location, you may have rights to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Withdraw consent for data processing.</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at <span className="text-cyan-400">support@pricelensai.com</span>.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">7. Security</h2>
            <p>
              We implement industry-standard security measures including encryption in transit (HTTPS) and at rest. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">8. Children's Privacy</h2>
            <p>
              Pricelens AI is not directed to children under 13. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes via the app or email.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:<br />
              <span className="text-cyan-400">support@pricelensai.com</span>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}