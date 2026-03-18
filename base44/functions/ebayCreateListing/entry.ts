import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, price, quantity, condition, category, images } = await req.json();

    const appId = Deno.env.get('EBAY_APP_ID');
    const certId = Deno.env.get('EBAY_CERT_ID');
    const userToken = Deno.env.get('EBAY_USER_TOKEN');
    const environment = Deno.env.get('EBAY_ENVIRONMENT') || 'sandbox';

    if (!appId || !certId || !userToken) {
      return Response.json({
        error: 'eBay credentials not configured',
        message: 'Please set up your eBay API credentials in the app settings. Visit https://developer.ebay.com/my/keys to get your credentials.',
        needs_setup: true
      }, { status: 400 });
    }

    const baseUrl = environment === 'production'
      ? 'https://api.ebay.com'
      : 'https://api.sandbox.ebay.com';

    const sku = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const inventoryItem = {
      availability: {
        shipToLocationAvailability: { quantity: quantity || 1 }
      },
      condition: condition?.toUpperCase() || 'USED_EXCELLENT',
      product: {
        title,
        description,
        imageUrls: images || [],
        aspects: {
          Brand: ['Generic'],
          Type: [category || 'Other']
        }
      }
    };

    const inventoryResponse = await fetch(`${baseUrl}/sell/inventory/v1/inventory_item/${sku}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US'
      },
      body: JSON.stringify(inventoryItem)
    });

    if (!inventoryResponse.ok) {
      const errorData = await inventoryResponse.json();
      console.error('eBay inventory creation failed:', errorData);
      return Response.json({ error: 'Failed to create eBay inventory item', details: errorData }, { status: inventoryResponse.status });
    }

    const offer = {
      sku,
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      availableQuantity: quantity || 1,
      categoryId: '36',
      listingDescription: description,
      pricingSummary: {
        price: { value: price.toString(), currency: 'USD' }
      },
      merchantLocationKey: 'default_location'
    };

    const offerResponse = await fetch(`${baseUrl}/sell/inventory/v1/offer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US'
      },
      body: JSON.stringify(offer)
    });

    if (!offerResponse.ok) {
      const errorData = await offerResponse.json();
      console.error('eBay offer creation failed:', errorData);
      return Response.json({ error: 'Failed to create eBay offer', details: errorData }, { status: offerResponse.status });
    }

    const offerData = await offerResponse.json();

    const publishResponse = await fetch(`${baseUrl}/sell/inventory/v1/offer/${offerData.offerId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      console.error('eBay publish failed:', errorData);
      return Response.json({ error: 'Failed to publish eBay listing', details: errorData }, { status: publishResponse.status });
    }

    const publishData = await publishResponse.json();

    return Response.json({
      success: true,
      listing_id: publishData.listingId,
      offer_id: offerData.offerId,
      sku,
      listing_url: `https://${environment === 'production' ? 'www' : 'sandbox'}.ebay.com/itm/${publishData.listingId}`
    });

  } catch (error) {
    console.error('eBay listing creation error:', error);
    return Response.json({ error: 'Failed to create eBay listing', message: error.message }, { status: 500 });
  }
});