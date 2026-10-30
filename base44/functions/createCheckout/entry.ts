import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planType } = await req.json();

    if (!priceId) {
      return Response.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Return URLs must come from the server-set app URL header — never Origin or Host.
    const appUrl = req.headers.get('X-Base44-App-Url');
    if (!appUrl) {
      console.error('Missing X-Base44-App-Url header — cannot build return URLs');
      return Response.json({ error: 'App URL unavailable' }, { status: 400 });
    }
    const baseUrl = appUrl.replace(/\/$/, '');

    const price = await stripe.prices.retrieve(priceId);
    const isRecurring = price.type === 'recurring';

    const metadata = {
      base44_app_id: Deno.env.get('BASE44_APP_ID'),
      user_email: user.email,
      plan_type: planType || 'premium'
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: `${baseUrl}/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/Pricing`,
      customer_email: user.email,
      metadata,
      // Subscriptions carry app tracking metadata on the subscription itself
      ...(isRecurring ? { subscription_data: { metadata } } : {})
    });

    console.log('Checkout session created:', session.id, 'for:', user.email, 'mode:', session.mode);
    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});