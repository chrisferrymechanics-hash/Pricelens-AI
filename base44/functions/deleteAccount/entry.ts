import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Stop billing before the account disappears — otherwise a cancelled user keeps getting charged.
    if (user.stripe_subscription_id) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        await stripe.subscriptions.cancel(user.stripe_subscription_id);
        console.log('Cancelled subscription for deleted account:', user.stripe_subscription_id);
      } catch (err) {
        console.error('Could not cancel subscription on deletion:', user.stripe_subscription_id, err.message);
      }
    }

    // Delete everything the user owns
    const entities = [
      base44.asServiceRole.entities.PriceEvaluation,
      base44.asServiceRole.entities.Subscription,
      base44.asServiceRole.entities.MarketplaceListing,
      base44.asServiceRole.entities.WatchlistItem,
      base44.asServiceRole.entities.Collection,
      base44.asServiceRole.entities.BuyOpportunity,
    ];
    for (const entity of entities) {
      await entity.deleteMany({ created_by: user.email });
    }

    await base44.asServiceRole.entities.User.delete(user.id);

    console.log('Account deleted:', user.email);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});