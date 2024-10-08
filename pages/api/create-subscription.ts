import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const session = await getSession(req, res)
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    // Check if the customer already exists
    const customers = await stripe.customers.list({ email: session.user.email, limit: 1 })
    let customerId: string

    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      // Create a new customer if one doesn't exist
      const newCustomer = await stripe.customers.create({ email: session.user.email })
      customerId = newCustomer.id
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/canceled`,
    })

    res.status(200).json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Subscription creation error:', error)
    res.status(500).json({ error: 'Error creating subscription' })
  }
}