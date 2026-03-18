import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user data
    const deletePromises = [
      base44.asServiceRole.entities.PriceEvaluation.filter({ created_by: user.email })
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.PriceEvaluation.delete(i.id)))),
      base44.asServiceRole.entities.Subscription.filter({ created_by: user.email })
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Subscription.delete(i.id)))),
      base44.asServiceRole.entities.MarketplaceListing.filter({ created_by: user.email })
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.MarketplaceListing.delete(i.id)))),
      base44.asServiceRole.entities.WatchlistItem.filter({ created_by: user.email })
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.WatchlistItem.delete(i.id)))),
      base44.asServiceRole.entities.Collection.filter({ created_by: user.email })
        .then(items => Promise.all(items.map(i => base44.asServiceRole.entities.Collection.delete(i.id))))
    ];

    await Promise.all(deletePromises);

    // Delete user account
    await base44.asServiceRole.entities.User.delete(user.id);

    console.log('Account deleted:', user.email);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});