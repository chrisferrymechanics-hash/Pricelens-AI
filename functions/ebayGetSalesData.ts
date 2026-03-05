import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userToken = Deno.env.get('EBAY_USER_TOKEN');
    const environment = Deno.env.get('EBAY_ENVIRONMENT') || 'sandbox';

    if (!userToken) {
      return Response.json({ error: 'eBay credentials not configured', needs_setup: true }, { status: 400 });
    }

    const baseUrl = environment === 'production'
      ? 'https://api.ebay.com'
      : 'https://api.sandbox.ebay.com';

    const response = await fetch(`${baseUrl}/sell/fulfillment/v1/order?limit=50`, {
      headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('eBay orders fetch failed:', errorData);
      return Response.json({ error: 'Failed to fetch eBay orders', details: errorData }, { status: response.status });
    }

    const ordersData = await response.json();
    const salesData = [];

    const listings = await base44.entities.MarketplaceListing.filter({
      created_by: user.email,
      platform: 'ebay'
    });

    for (const order of ordersData.orders || []) {
      for (const lineItem of order.lineItems || []) {
        const matchingListing = listings.find(l => l.platform_listing_id === lineItem.legacyItemId);

        if (matchingListing) {
          await base44.asServiceRole.entities.MarketplaceListing.update(matchingListing.id, {
            quantity_sold: (matchingListing.quantity_sold || 0) + lineItem.quantity,
            status: lineItem.quantity >= (matchingListing.quantity || 1) ? 'sold' : 'active',
            sales_data: {
              sale_date: order.creationDate,
              sale_price: parseFloat(lineItem.total.value),
              buyer_username: order.buyer?.username || 'Unknown'
            },
            last_synced: new Date().toISOString()
          });

          salesData.push({
            listing_id: matchingListing.id,
            order_id: order.orderId,
            quantity_sold: lineItem.quantity,
            sale_price: lineItem.total.value,
            sale_date: order.creationDate
          });
        }
      }
    }

    return Response.json({
      success: true,
      total_orders: ordersData.orders?.length || 0,
      sales_data: salesData
    });

  } catch (error) {
    console.error('eBay sales data error:', error);
    return Response.json({ error: 'Failed to fetch eBay sales data', message: error.message }, { status: 500 });
  }
});