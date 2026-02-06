import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Store, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import MobileSelect from '@/components/MobileSelect';

export default function MarketplaceListingForm({ result, onSuccess }) {
  const [formData, setFormData] = useState({
    title: result?.item_name || '',
    description: result?.item_description || '',
    price: result?.secondhand_price_low || result?.estimated_value_low || '',
    quantity: 1,
    condition: 'used_excellent',
    category: result?.category || result?.collectible_type || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'used_excellent', label: 'Used - Excellent' },
    { value: 'used_good', label: 'Used - Good' },
    { value: 'used_fair', label: 'Used - Fair' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { base44 } = await import('@/api/base44Client');

      // Collect images
      const images = [];
      if (result?.image_url) images.push(result.image_url);
      if (result?.front_image_url) images.push(result.front_image_url);
      if (result?.back_image_url) images.push(result.back_image_url);
      if (result?.additional_image_urls) images.push(...result.additional_image_urls);

      // Create listing via backend
      const response = await base44.functions.invoke('ebayCreateListing', {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        condition: formData.condition,
        category: formData.category,
        images: images.filter(Boolean)
      });

      if (response.data.needs_setup) {
        setError('Please set up your eBay API credentials first. Visit Settings > Integrations to configure eBay.');
        setIsSubmitting(false);
        return;
      }

      if (response.data.error) {
        setError(response.data.error);
        setIsSubmitting(false);
        return;
      }

      // Save to database
      await base44.entities.MarketplaceListing.create({
        evaluation_id: result?.id,
        platform: 'ebay',
        platform_listing_id: response.data.listing_id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        condition: formData.condition,
        category: formData.category,
        images: images.filter(Boolean),
        status: 'active',
        listing_url: response.data.listing_url,
        last_synced: new Date().toISOString()
      });

      setSuccess(true);
      if (onSuccess) onSuccess(response.data);

    } catch (err) {
      console.error('Listing creation error:', err);
      setError(err.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center"
      >
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Listed on eBay!</h3>
        <p className="text-slate-400 text-sm">Your item has been successfully listed on eBay.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div>
        <label className="text-sm text-slate-400 mb-1.5 block">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Item title"
          required
          className="bg-slate-800/50 border-slate-700"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1.5 block">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description"
          required
          rows={4}
          className="bg-slate-800/50 border-slate-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Price ($)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            required
            className="bg-slate-800/50 border-slate-700"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Quantity</label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="1"
            required
            min="1"
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1.5 block">Condition</label>
        <MobileSelect
          value={formData.condition}
          onValueChange={(value) => setFormData({ ...formData, condition: value })}
          options={conditionOptions}
          placeholder="Select condition"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1.5 block">Category</label>
        <Input
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="Item category"
          className="bg-slate-800/50 border-slate-700"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Listing...
          </>
        ) : (
          <>
            <Store className="w-4 h-4 mr-2" />
            List on eBay
          </>
        )}
      </Button>
    </form>
  );
}