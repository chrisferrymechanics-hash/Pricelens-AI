import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Search, Sparkles, Gem } from 'lucide-react';
import { motion } from 'framer-motion';

import CameraCapture from '@/components/CameraCapture';
import KeywordSearch from '@/components/KeywordSearch';
import PriceResults from '@/components/PriceResults';
import CollectiblesCapture from '@/components/CollectiblesCapture';
import CollectiblesResults from '@/components/CollectiblesResults';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [collectibleResult, setCollectibleResult] = useState(null);
  const [activeTab, setActiveTab] = useState('camera');
  const [userLocation, setUserLocation] = useState(null);
  const [user, setUser] = useState(null);
  const [evaluationCount, setEvaluationCount] = useState(0);

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
        // Count evaluations this month
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        base44.entities.PriceEvaluation.filter({
          created_by: currentUser.email
        }).then(evals => {
          const monthlyEvals = evals.filter(e => new Date(e.created_date) >= firstOfMonth);
          setEvaluationCount(monthlyEvals.length);
        });
      }
    });
  }, []);

  const analyzeWithAI = async (prompt, imageUrl = null) => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      file_urls: imageUrl ? [imageUrl] : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          item_name: { type: "string" },
          item_description: { type: "string" },
          category: { type: "string" },
          condition_estimate: { type: "string", enum: ["new", "like_new", "good", "fair", "poor"] },
          condition_score: { type: "number", minimum: 1, maximum: 10 },
          condition_details: {
            type: "object",
            properties: {
              summary: { type: "string" },
              defects_found: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    severity: { type: "string", enum: ["minor", "moderate", "severe"] },
                    location: { type: "string" },
                    price_impact: { type: "string" }
                  }
                }
              },
              wear_level: { type: "string" },
              functionality_assessment: { type: "string" },
              cosmetic_rating: { type: "number", minimum: 1, maximum: 10 },
              completeness: { type: "string" }
            }
          },
          new_price_low: { type: "number" },
          new_price_high: { type: "number" },
          secondhand_price_low: { type: "number" },
          secondhand_price_high: { type: "number" },
          auction_price_low: { type: "number" },
          auction_price_high: { type: "number" },
          buy_recommendations: {
            type: "array",
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                price_range: { type: "string" },
                url: { type: "string" },
                is_local: { type: "boolean" }
              }
            }
          },
          sell_recommendations: {
            type: "array",
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                expected_price: { type: "string" },
                fees: { type: "string" },
                time_to_sell: { type: "string" },
                url: { type: "string" },
                is_local: { type: "boolean" }
              }
            }
          }
        }
      }
    });
    return response;
  };

  const canEvaluate = () => {
    if (!user) return false;
    if (user.plan_type === 'premium') return true;
    if (user.credits > 0) return true;
    if (evaluationCount < 5) return true;
    return false;
  };

  const handleImageCapture = async (file) => {
    if (!canEvaluate()) {
      alert('You have reached your monthly limit. Upgrade to Premium for unlimited evaluations or buy credits.');
      return;
    }
    
    setIsProcessing(true);
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const analysisResult = await analyzeWithAI(
      `Analyze this image and identify the item. CAREFULLY EXAMINE THE CONDITION by looking for:
      - Scratches, scuffs, or surface damage
      - Dents, cracks, or structural damage
      - Discoloration, stains, or fading
      - Signs of wear and tear (worn edges, loose parts)
      - Missing components or accessories
      - Overall cleanliness and maintenance level
      
      Provide a detailed condition assessment with:
      - condition_score (1-10, where 10 is mint/perfect)
      - condition_details including: summary, specific defects found (type, severity, location, price impact), wear level, functionality assessment, cosmetic rating (1-10), and completeness
      
      Then search the internet for current market prices. ADJUST PRICES BASED ON THE CONDITION YOU OBSERVED:
      1. Item name and description
      2. NEW retail prices (price range)
      3. SECONDHAND/USED prices - adjust based on condition defects found
      4. AUCTION prices - factor in condition for realistic auction estimates
      5. TOP 5 best platforms to BUY this item - PRIORITIZE LOCAL STORES AND MARKETPLACES FIRST${userLocation ? ` (user location: ${userLocation.lat}, ${userLocation.lng})` : ''}, then national/online options. Include price ranges and direct URLs.
      6. TOP 5 best platforms to SELL this item - PRIORITIZE LOCAL OPTIONS FIRST${userLocation ? ` (user location: ${userLocation.lat}, ${userLocation.lng})` : ''}, then online marketplaces. Include expected prices adjusted for condition, fees, time to sell, and URLs.
      
      Mark each recommendation with is_local: true/false. Be specific with price ranges in USD. Include actual working URLs.`,
      file_url
    );

    const finalResult = {
      ...analysisResult,
      image_url: file_url
    };

    await base44.entities.PriceEvaluation.create(finalResult);
    
    // Deduct credit if applicable
    if (user && user.plan_type !== 'premium' && user.credits > 0) {
      await base44.auth.updateMe({ credits: user.credits - 1 });
      setUser({ ...user, credits: user.credits - 1 });
    } else if (user && user.plan_type !== 'premium') {
      setEvaluationCount(evaluationCount + 1);
    }
    
    setResult(finalResult);
    setIsProcessing(false);
  };

  const handleKeywordSearch = async (query) => {
    if (!canEvaluate()) {
      alert('You have reached your monthly limit. Upgrade to Premium for unlimited evaluations or buy credits.');
      return;
    }
    
    setIsProcessing(true);
    
    const analysisResult = await analyzeWithAI(
      `Search the internet for "${query}" and provide current market pricing information:
      1. Full product name and brief description
      2. NEW retail prices (price range from major retailers)
      3. SECONDHAND/USED prices from marketplaces like eBay, Facebook Marketplace, Craigslist, Mercari
      4. AUCTION prices from eBay auctions, estate sales, auction houses
      5. TOP 5 best platforms to BUY this item - PRIORITIZE LOCAL STORES AND MARKETPLACES FIRST${userLocation ? ` (user location: ${userLocation.lat}, ${userLocation.lng})` : ''}, then national/online options. Include price ranges and direct URLs.
      6. TOP 5 best platforms to SELL this item - PRIORITIZE LOCAL OPTIONS FIRST${userLocation ? ` (user location: ${userLocation.lat}, ${userLocation.lng})` : ''}, then online marketplaces. Include expected prices, seller fees, typical time to sell, and URLs.
      
      Mark each recommendation with is_local: true/false. Search for real, current market prices. Be specific with price ranges in USD. Include actual working URLs.`
    );

    const finalResult = {
      ...analysisResult,
      search_query: query
    };

    await base44.entities.PriceEvaluation.create(finalResult);
    
    // Deduct credit if applicable
    if (user && user.plan_type !== 'premium' && user.credits > 0) {
      await base44.auth.updateMe({ credits: user.credits - 1 });
      setUser({ ...user, credits: user.credits - 1 });
    } else if (user && user.plan_type !== 'premium') {
      setEvaluationCount(evaluationCount + 1);
    }
    
    setResult(finalResult);
    setIsProcessing(false);
  };

  const handleBack = () => {
    setResult(null);
    setCollectibleResult(null);
  };

  const handleCollectiblesCapture = async (frontFile, backFile) => {
    if (!canEvaluate()) {
      alert('You have reached your monthly limit. Upgrade to Premium for unlimited evaluations or buy credits.');
      return;
    }
    
    setIsProcessing(true);
    
    const { file_url: frontUrl } = await base44.integrations.Core.UploadFile({ file: frontFile });
    let backUrl = null;
    if (backFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: backFile });
      backUrl = file_url;
    }
    
    const fileUrls = backUrl ? [frontUrl, backUrl] : [frontUrl];
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert collectibles appraiser with access to PSA, PCGS, NGC, CGC, and other major grading services' databases. Analyze ${backUrl ? 'both the FRONT and BACK images' : 'this image'} of a collectible item.

    STEP 1: IMAGE RECOGNITION - EXTRACT SPECIFIC DETAILS:
    Look carefully at the images and identify:
    - Serial numbers, certification numbers, or unique identifiers (look at edges, backs, margins)
    - Mint marks, designer initials, or manufacturer stamps
    - Artist signatures or autographs (examine corners, backs, borders)
    - Year/date markings (any visible dates on the item)
    - Edition numbers or variant identifiers
    - Grade labels if already professionally graded

    STEP 2: IDENTIFY THE COLLECTIBLE:
    - Exact name/title of the item
    - Collectible type (coin, stamp, comic, trading_card, antique, memorabilia, other)
    - Mint/publisher/manufacturer
    - Edition, series, or variant
    - Any special markings, errors, or distinguishing features

    STEP 3: EXTERNAL DATABASE LOOKUP:
    Search PSA, PCGS, NGC, CGC, Heritage Auctions, eBay sold listings, and specialized databases for:
    - Official grading standards for this specific item
    - Historical sales data (recent sales with dates, prices, grades, platforms)
    - Population reports (how many graded at each level)
    - Recommended grading service for this type of collectible

    STEP 4: GRADING STANDARDS:
    Based on the database information, provide:
    - Which grading service is best (PSA for cards, PCGS for coins, CGC for comics, etc.)
    - Their grading scale (e.g., PSA 1-10, PCGS 1-70, CGC 0.5-10.0)
    - Estimated grade based on visible condition
    - Grading criteria that apply to this item

    STEP 5: RARITY & AUTHENTICITY:
    - Rarity level and score (1-10)
    - Key identifiers affecting rarity
    - Authenticity confidence (0-100%) with specific notes

    STEP 6: VALUE ESTIMATION:
    Using historical sales data from databases:
    - Estimated value range (ungraded)
    - Estimated value range (if professionally graded)
    - Factor in the specific serial number, mint mark, or signature if rare

    STEP 7: TRADING PLATFORMS (TOP 5):
    - Specialized platforms for this collectible type with URLs
    - Recent price ranges from actual sales
    - Mark specialized platforms with is_specialized: true

    Search the internet extensively for ALL this information. Be thorough and specific with USD prices and dates.`,
      add_context_from_internet: true,
      file_urls: fileUrls,
      response_json_schema: {
        type: "object",
        properties: {
          item_name: { type: "string" },
          item_description: { type: "string" },
          collectible_type: { type: "string", enum: ["coin", "stamp", "comic", "trading_card", "antique", "memorabilia", "other"] },
          serial_number: { type: "string" },
          mint_mark: { type: "string" },
          artist_signature: { type: "string" },
          year: { type: "string" },
          edition: { type: "string" },
          rarity: { type: "string", enum: ["common", "uncommon", "rare", "very_rare", "extremely_rare", "legendary"] },
          rarity_score: { type: "number", minimum: 1, maximum: 10 },
          key_identifiers: { type: "array", items: { type: "string" } },
          authenticity: {
            type: "object",
            properties: {
              confidence: { type: "number", minimum: 0, maximum: 100 },
              notes: { type: "string" }
            }
          },
          grading_service: { type: "string" },
          grading_standards: {
            type: "object",
            properties: {
              service: { type: "string" },
              scale: { type: "string" },
              estimated_grade: { type: "string" },
              criteria: { type: "string" }
            }
          },
          historical_sales: {
            type: "array",
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                price: { type: "number" },
                grade: { type: "string" },
                platform: { type: "string" },
                url: { type: "string" }
              }
            }
          },
          grading_recommendation: { type: "string" },
          estimated_value_low: { type: "number" },
          estimated_value_high: { type: "number" },
          graded_value_low: { type: "number" },
          graded_value_high: { type: "number" },
          trading_platforms: {
            type: "array",
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                price_range: { type: "string" },
                url: { type: "string" },
                notes: { type: "string" },
                is_specialized: { type: "boolean" },
                is_local: { type: "boolean" }
              }
            }
          }
        }
      }
    });

    const finalResult = {
      ...response,
      front_image_url: frontUrl,
      back_image_url: backUrl
    };

    await base44.entities.PriceEvaluation.create(finalResult);
    
    // Deduct credit if applicable
    if (user && user.plan_type !== 'premium' && user.credits > 0) {
      await base44.auth.updateMe({ credits: user.credits - 1 });
      setUser({ ...user, credits: user.credits - 1 });
    } else if (user && user.plan_type !== 'premium') {
      setEvaluationCount(evaluationCount + 1);
    }
    
    setCollectibleResult(finalResult);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">AI-Powered</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Price Scout</h1>
          <p className="text-slate-400">Find the best prices for anything</p>
          {user && (
            <div className="mt-3 text-sm text-slate-400">
              {user.plan_type === 'premium' ? (
                <span className="text-emerald-400">Premium • Unlimited evaluations</span>
              ) : user.credits > 0 ? (
                <span>{user.credits} credits remaining</span>
              ) : (
                <span>{5 - evaluationCount} free evaluations remaining this month</span>
              )}
            </div>
          )}
          </motion.div>

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

            <TabsContent value="search" className="mt-0">
              <KeywordSearch onSearch={handleKeywordSearch} isProcessing={isProcessing} />
            </TabsContent>
          </Tabs>
        )}
    </div>
  );
}