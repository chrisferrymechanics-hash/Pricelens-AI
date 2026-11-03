import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return Response.json({ error: 'Missing session id' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Only report on the caller's own purchase
    const owner = session.metadata?.user_email || session.customer_email;
    if (owner && owner !== user.email) {
      console.error('Session does not belong to caller:', session.id, user.email);
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return Response.json({
      paid: session.payment_status === 'paid',
      status: session.payment_status,
      mode: session.mode
    });
  } catch (error) {
    console.error('Verify checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});