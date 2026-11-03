import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = req.headers.get('X-Base44-App-Url');
    if (!appUrl) {
      console.error('Missing X-Base44-App-Url header — cannot build return URL');
      return Response.json({ error: 'App URL unavailable' }, { status: 400 });
    }
    const baseUrl = appUrl.replace(/\/$/, '');

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Prefer the stored customer, then fall back to the email on record
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const found = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = found.data[0]?.id;
    }

    if (!customerId) {
      console.log('No Stripe customer for:', user.email);
      return Response.json({ error: 'No billing account found for this user' }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/Settings`
    });

    console.log('Billing portal opened for:', user.email);
    return Response.json({ url: portal.url });
  } catch (error) {
    console.error('Billing portal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});