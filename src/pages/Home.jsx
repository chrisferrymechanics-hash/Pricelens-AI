import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import CameraCapture from '@/components/CameraCapture';
import KeywordSearch from '@/components/KeywordSearch';
import PriceResults from '@/components/PriceResults';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('camera');
  const [userLocation, setUserLocation] = useState(null);

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

  const handleImageCapture = async (file) => {
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
    setResult(finalResult);
    setIsProcessing(false);
  };

  const handleKeywordSearch = async (query) => {
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
    setResult(finalResult);
    setIsProcessing(false);
  };

  const handleBack = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-lg mx-auto px-4 py-6 pb-20">
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
        </motion.div>

        {/* Main Content */}
        {result ? (
          <PriceResults result={result} onBack={handleBack} onSearchSimilar={handleKeywordSearch} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-1 mb-6">
              <TabsTrigger 
                value="camera" 
                className="flex-1 data-[state=active]:bg-slate-700 rounded-lg py-2.5 text-slate-400 data-[state=active]:text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="flex-1 data-[state=active]:bg-slate-700 rounded-lg py-2.5 text-slate-400 data-[state=active]:text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="mt-0">
              <CameraCapture onCapture={handleImageCapture} isProcessing={isProcessing} />
            </TabsContent>

            <TabsContent value="search" className="mt-0">
              <KeywordSearch onSearch={handleKeywordSearch} isProcessing={isProcessing} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}