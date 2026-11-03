import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Search, Sparkles, Gem, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

import CameraCapture from '@/components/CameraCapture';
import KeywordSearch from '@/components/KeywordSearch';
import PriceResults from '@/components/PriceResults';
import CollectiblesCapture from '@/components/CollectiblesCapture';
import CollectiblesResults from '@/components/CollectiblesResults';
import BulkUpload from '@/components/BulkUpload';

import { runAI } from '@/lib/ai/runAI';
import { APPRAISAL_SCHEMA, COLLECTIBLE_SCHEMA } from '@/lib/ai/schemas';
import { buildAppraisalPrompt, buildKeywordPrompt, buildCollectiblePrompt } from '@/lib/ai/prompts';
import { normalizeAppraisal, normalizeCollectible } from '@/lib/ai/normalize';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [collectibleResult, setCollectibleResult] = useState(null);
  const [activeTab, setActiveTab] = useState('camera');
  const [userLocation, setUserLocation] = useState(null);
  const [user, setUser] = useState(null);
  const [evaluationCount, setEvaluationCount] = useState(0);
  const [error, setError] = useState(null);
  // Refs mirror the quota state so a running batch always sees the current balance
  const userRef = React.useRef(null);
  const creditsRef = React.useRef(0);
  const freeUsedRef = React.useRef(0);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {} // Silently fail if denied
      );
    }

    base44.auth.me().then((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        userRef.current = currentUser;
        creditsRef.current = currentUser.credits || 0;
        // Count evaluations this month
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        base44.entities.PriceEvaluation.filter({
          created_by: currentUser.email
        }).then(evals => {
          const monthlyEvals = evals.filter(e => new Date(e.created_date) >= firstOfMonth);
          setEvaluationCount(monthlyEvals.length);
          freeUsedRef.current = monthlyEvals.length;
        });
      }
    });
  }, []);

  const analyzeWithAI = async (prompt, imageUrls = []) => {
    const raw = await runAI({ prompt, schema: APPRAISAL_SCHEMA, fileUrls: imageUrls });
    return normalizeAppraisal(raw);
  };

  const canEvaluate = () => {
    const current = userRef.current;
    if (!current) return false;
    if (current.plan_type === 'premium') return true;
    if (creditsRef.current > 0) return true;
    return freeUsedRef.current < 4;
  };

  // One evaluation used: spend a credit if they have one, otherwise a free monthly slot
  const consumeQuota = async () => {
    const current = userRef.current;
    if (!current || current.plan_type === 'premium') return;
    if (creditsRef.current > 0) {
      const next = creditsRef.current - 1;
      creditsRef.current = next;
      await base44.auth.updateMe({ credits: next });
      setUser((prev) => (prev ? { ...prev, credits: next } : prev));
    } else {
      freeUsedRef.current += 1;
      setEvaluationCount(freeUsedRef.current);
    }
  };

  const handleImageCapture = async (file) => {
    if (!canEvaluate()) {
      alert('You have reached your monthly limit. Upgrade to Premium for unlimited evaluations or buy credits.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });

      const analysisResult = await analyzeWithAI(
        buildAppraisalPrompt({ userLocation }),
        [file_url]
      );

      const finalResult = {
        ...analysisResult,
        image_url: file_url
      };

      await base44.entities.PriceEvaluation.create(finalResult);

      await consumeQuota();

      setResult(finalResult);
    } catch (err) {
      console.error('Image capture error:', err);
      setError('Could not complete this appraisal. No credit was used — please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeywordSearch = async (query) => {
    if (!canEvaluate()) {
      alert('You have reached your monthly limit. Upgrade to Premium for unlimited evaluations or buy credits.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const analysisResult = await analyzeWithAI(
        buildKeywordPrompt({ query, userLocation })
      );

      const finalResult = {
        ...analysisResult,
        search_query: query
      };

      await base44.entities.PriceEvaluation.create(finalResult);

      await consumeQuota();

      setResult(finalResult);
    } catch (err) {
      console.error('Keyword search error:', err);
      setError('Could not complete this price research. No credit was used — please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setResult(null);
    setCollectibleResult(null);
  };

  const handleCollectiblesCapture = async (files) => {
    if (!canEvaluate()) {
      alert('You have reached your monthly limit. Upgrade to Premium for unlimited evaluations or buy credits.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      // Upload all images
      const uploadPromises = files.map(file =>
        base44.integrations.Core.UploadPublicFile({ file })
      );
      const uploadResults = await Promise.all(uploadPromises);
      const fileUrls = uploadResults.map(result => result.file_url);

      const raw = await runAI({
        prompt: buildCollectiblePrompt({ imageCount: fileUrls.length }),
        schema: COLLECTIBLE_SCHEMA,
        fileUrls,
      });
      const response = normalizeCollectible(raw);

      const finalResult = {
        ...response,
        front_image_url: fileUrls[0],
        back_image_url: fileUrls[1] || null,
        additional_image_urls: fileUrls.slice(2)
      };

      await base44.entities.PriceEvaluation.create(finalResult);

      await consumeQuota();

      setCollectibleResult(finalResult);
    } catch (err) {
      console.error('Collectibles capture error:', err);
      setError('Could not complete this collectible appraisal. No credit was used — please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-300 text-sm font-medium">AI-Powered</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pricelens AI</h1>
          <p className="text-slate-400">Find the best prices for anything</p>
          {user && (
            <div className="mt-3 text-sm text-slate-400">
              {user.plan_type === 'premium' ? (
                <span className="text-emerald-400">Premium • Unlimited evaluations</span>
              ) : user.credits > 0 ? (
                <span>{user.credits} credits remaining</span>
              ) : (
                <span>{Math.max(0, 4 - evaluationCount)} free evaluations remaining this month</span>
              )}
            </div>
          )}
          </motion.div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Main Content */}
        {collectibleResult ? (
          <CollectiblesResults result={collectibleResult} onBack={handleBack} />
        ) : result ? (
          <PriceResults result={result} onBack={handleBack} onSearchSimilar={handleKeywordSearch} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-1 mb-6">
              <TabsTrigger
                value="camera"
                className="flex-1 data-[state=active]:bg-slate-700 rounded-lg py-2 text-slate-400 data-[state=active]:text-white text-xs"
              >
                <Camera className="w-4 h-4 mr-1" />
                Camera
              </TabsTrigger>
              <TabsTrigger
                value="collectibles"
                className="flex-1 data-[state=active]:bg-slate-700 rounded-lg py-2 text-slate-400 data-[state=active]:text-white text-xs"
              >
                <Gem className="w-4 h-4 mr-1" />
                Collectibles
              </TabsTrigger>
              <TabsTrigger
                value="bulk"
                className="flex-1 data-[state=active]:bg-slate-700 rounded-lg py-2 text-slate-400 data-[state=active]:text-white text-xs"
              >
                <Layers className="w-4 h-4 mr-1" />
                Bulk
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="flex-1 data-[state=active]:bg-slate-700 rounded-lg py-2 text-slate-400 data-[state=active]:text-white text-xs"
              >
                <Search className="w-4 h-4 mr-1" />
                Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="mt-0">
              <CameraCapture onCapture={handleImageCapture} isProcessing={isProcessing} />
            </TabsContent>

            <TabsContent value="collectibles" className="mt-0">
              <CollectiblesCapture onCapture={handleCollectiblesCapture} isProcessing={isProcessing} />
            </TabsContent>

            <TabsContent value="bulk" className="mt-0">
              <BulkUpload
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                canEvaluate={canEvaluate}
                onConsumeQuota={consumeQuota}
              />
            </TabsContent>

            <TabsContent value="search" className="mt-0">
              <KeywordSearch onSearch={handleKeywordSearch} isProcessing={isProcessing} />
            </TabsContent>
          </Tabs>
        )}
    </div>
  );
}