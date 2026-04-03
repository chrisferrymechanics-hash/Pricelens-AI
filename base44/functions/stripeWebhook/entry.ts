import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.metadata?.user_email || session.customer_email;
        const planType = session.metadata?.plan_type || 'premium';

        console.log('Payment completed for:', userEmail, 'plan:', planType);

        if (!userEmail) {
          console.error('No user email in session metadata');
          break;
        }

        // Find the user
        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (!users || users.length === 0) {
          console.error('User not found:', userEmail);
          break;
        }
        const user = users[0];

        if (session.mode === 'subscription') {
          // Premium subscription purchase
          await base44.asServiceRole.entities.User.update(user.id, {
            plan_type: 'premium',
            subscription_id: session.subscription,
            subscription_status: 'active'
          });
          console.log('User upgraded to premium:', userEmail);
        } else if (session.mode === 'payment') {
          // Credit pack purchase — add 20 credits
          const currentCredits = user.credits || 0;
          await base44.asServiceRole.entities.User.update(user.id, {
            credits: currentCredits + 20
          });
          console.log('Added 20 credits to:', userEmail, 'new total:', currentCredits + 20);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);

        // Find user by subscription_id and downgrade
        const users = await base44.asServiceRole.entities.User.filter({ subscription_id: subscription.id });
        if (users && users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            plan_type: 'free',
            subscription_status: 'cancelled'
          });
          console.log('User downgraded to free:', users[0].email);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const isActive = subscription.status === 'active';
        console.log('Subscription updated:', subscription.id, 'status:', subscription.status);

        const users = await base44.asServiceRole.entities.User.filter({ subscription_id: subscription.id });
        if (users && users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: subscription.status,
            plan_type: isActive ? 'premium' : 'free'
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});