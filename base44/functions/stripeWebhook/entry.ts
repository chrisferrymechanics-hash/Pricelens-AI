import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
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
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;

        // Skip Base44 merchant self-test charges
        if (session.metadata?.base44_test_checkout === 'true') {
          console.log('Skipping Base44 test checkout:', session.id);
          break;
        }

        // Access is granted only once payment is actually confirmed
        if (session.payment_status !== 'paid') {
          console.log('Payment not confirmed yet — session:', session.id, 'status:', session.payment_status);
          break;
        }

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
          // Subscription purchase — use plan_type from metadata (pro/premium)
          await base44.asServiceRole.entities.User.update(user.id, {
            plan_type: planType,
            subscription_id: session.subscription,
            subscription_status: 'active'
          });
          console.log('User upgraded to', planType, ':', userEmail);
        } else if (session.mode === 'payment') {
          // Credit pack purchase — add the credits recorded on the session
          const creditsGranted = parseInt(session.metadata?.credits_granted || '20', 10);
          const currentCredits = user.credits || 0;
          await base44.asServiceRole.entities.User.update(user.id, {
            credits: currentCredits + creditsGranted
          });
          console.log('Added', creditsGranted, 'credits to:', userEmail, 'new total:', currentCredits + creditsGranted);
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

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const isActive = subscription.status === 'active';
        console.log('Subscription updated:', subscription.id, 'status:', subscription.status);

        const users = await base44.asServiceRole.entities.User.filter({ subscription_id: subscription.id });
        if (users && users.length > 0) {
          const subPlanType = subscription.metadata?.plan_type || 'premium';
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: subscription.status,
            plan_type: isActive ? subPlanType : 'free'
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const fullyRefunded = charge.refunded === true || charge.amount_refunded >= charge.amount;

        if (!fullyRefunded) {
          console.log('Partial refund — access unchanged. Charge:', charge.id);
          break;
        }

        let userEmail = null;
        let mode = null;
        let subscriptionId = null;
        let creditsGranted = 0;

        // Attribute the refund to the original checkout session
        if (charge.payment_intent) {
          const sessions = await stripe.checkout.sessions.list({ payment_intent: charge.payment_intent, limit: 1 });
          const session = sessions.data[0];
          if (session) {
            if (session.metadata?.base44_test_checkout === 'true') {
              console.log('Skipping refund of Base44 test checkout:', session.id);
              break;
            }
            userEmail = session.metadata?.user_email || session.customer_email;
            mode = session.mode;
            subscriptionId = session.subscription;
            creditsGranted = parseInt(session.metadata?.credits_granted || '0', 10);
          }
        }

        // Renewal charges have no checkout session — resolve through the invoice
        if (!mode && charge.invoice) {
          const invoice = await stripe.invoices.retrieve(charge.invoice);
          subscriptionId = invoice.subscription;
          mode = 'subscription';
        }

        let users = [];
        if (subscriptionId) {
          users = await base44.asServiceRole.entities.User.filter({ subscription_id: subscriptionId });
        }
        if ((!users || users.length === 0) && userEmail) {
          users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        }
        if (!users || users.length === 0) {
          console.error('Refund: no matching user. Charge:', charge.id, 'email:', userEmail);
          break;
        }
        const refundUser = users[0];

        if (mode === 'subscription') {
          if (subscriptionId) {
            try {
              await stripe.subscriptions.cancel(subscriptionId);
            } catch (err) {
              console.warn('Could not cancel refunded subscription:', subscriptionId, err.message);
            }
          }
          await base44.asServiceRole.entities.User.update(refundUser.id, {
            plan_type: 'free',
            subscription_status: 'refunded'
          });
          console.log('Refund revoked subscription access for:', refundUser.email);
        } else {
          const remaining = Math.max(0, (refundUser.credits || 0) - creditsGranted);
          await base44.asServiceRole.entities.User.update(refundUser.id, { credits: remaining });
          console.log('Refund removed', creditsGranted, 'credits from:', refundUser.email, 'new total:', remaining);
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