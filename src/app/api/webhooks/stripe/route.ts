import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('users').update({
          is_premium: true,
          stripe_subscription_id: session.subscription as string,
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('users').update({
        is_premium: false,
        stripe_subscription_id: null,
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      // Optionally: log or notify — subscription still active until grace period
      const invoice = event.data.object as Stripe.Invoice
      console.warn(`Payment failed for customer ${invoice.customer}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
