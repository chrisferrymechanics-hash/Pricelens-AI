import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planType } = await req.json();

    if (!priceId) {
      return Response.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Check if running in iframe (preview mode)
    const referer = req.headers.get('referer') || '';
    const isIframe = referer.includes('/preview/') || referer.includes('iframe');

    if (isIframe) {
      return Response.json({ 
        error: 'Checkout is not available in preview mode. Please open the published app.',
        isIframeError: true 
      }, { status: 400 });
    }

    // Fetch the price to determine if it's recurring
    const price = await stripe.prices.retrieve(priceId);
    const isRecurring = price.type === 'recurring';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: `${req.headers.get('origin') || 'https://your-app.com'}/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || 'https://your-app.com'}/Pricing`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        plan_type: planType || 'premium'
      }
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});