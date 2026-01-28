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
          new_price_low: { type: "number" },
          new_price_high: { type: "number" },
          secondhand_price_low: { type: "number" },
          secondhand_price_high: { type: "number" },
          auction_price_low: { type: "number" },
          auction_price_high: { type: "number" },
          buy_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                price_range: { type: "string" },
                url: { type: "string" }
              }
            }
          },
          sell_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                expected_price: { type: "string" },
                fees: { type: "string" },
                time_to_sell: { type: "string" },
                url: { type: "string" }
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
      `Analyze this image and identify the item. Search the internet for current market prices. Provide:
      1. Item name and description
      2. NEW retail prices (price range)
      3. SECONDHAND/USED prices from marketplaces like eBay, Facebook Marketplace, Craigslist
      4. AUCTION prices from eBay auctions, estate sales
      5. Best platforms to BUY this item (with current price ranges and direct URLs to search/product pages)
      6. Best platforms to SELL this item (with expected prices, fees, typical time to sell, and URLs to their selling pages)
      
      Search for real, current prices. Be specific with price ranges in USD. Include actual working URLs to each platform's relevant page.`,
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
      5. Best platforms to BUY this item (with current price ranges and direct URLs to search/product pages)
      6. Best platforms to SELL this item (with expected prices, seller fees, typical time to sell, and URLs to their selling pages)
      
      Search for real, current market prices. Be specific with price ranges in USD. Include actual working URLs to each platform's relevant page.`
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