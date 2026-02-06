import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for eBay credentials
    const userToken = Deno.env.get('EBAY_USER_TOKEN');
    const environment = Deno.env.get('EBAY_ENVIRONMENT') || 'sandbox';

    if (!userToken) {
      return Response.json({
        error: 'eBay credentials not configured',
        needs_setup: true
      }, { status: 400 });
    }

    // Get all user's listings from database
    const listings = await base44.entities.MarketplaceListing.filter({
      created_by: user.email,
      platform: 'ebay'
    });

    const syncResults = [];

    for (const listing of listings) {
      if (!listing.platform_listing_id) continue;

      try {
        // Fetch listing details from eBay
        const apiUrl = environment === 'production'
          ? `https://api.ebay.com/sell/inventory/v1/inventory_item/${listing.platform_listing_id}`
          : `https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item/${listing.platform_listing_id}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const ebayData = await response.json();
          
          // Update local database with eBay data
          await base44.asServiceRole.entities.MarketplaceListing.update(listing.id, {
            quantity: ebayData.availability?.shipToLocationAvailability?.quantity || 0,
            last_synced: new Date().toISOString(),
            sync_errors: []
          });

          syncResults.push({
            listing_id: listing.id,
            status: 'synced',
            quantity: ebayData.availability?.shipToLocationAvailability?.quantity
          });
        } else {
          const errorData = await response.json();
          await base44.asServiceRole.entities.MarketplaceListing.update(listing.id, {
            last_synced: new Date().toISOString(),
            sync_errors: [errorData.errors?.[0]?.message || 'Sync failed']
          });

          syncResults.push({
            listing_id: listing.id,
            status: 'error',
            error: errorData.errors?.[0]?.message
          });
        }
      } catch (error) {
        console.error(`Error syncing listing ${listing.id}:`, error);
        syncResults.push({
          listing_id: listing.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      synced_count: syncResults.filter(r => r.status === 'synced').length,
      error_count: syncResults.filter(r => r.status === 'error').length,
      results: syncResults
    });

  } catch (error) {
    console.error('eBay sync error:', error);
    return Response.json({ 
      error: 'Failed to sync eBay listings', 
      message: error.message 
    }, { status: 500 });
  }
});