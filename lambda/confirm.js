import stripe from './helpers/stripe'
import {getTrackingCodeRecord, updateTrackingCodeRecord} from './helpers/fauna'
import getRapidLeiClient from './helpers/getRapidLeiClient'
import getStripeCustomer from './helpers/getStripeCustomer'

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {statusCode: 405, body: 'Method Not Allowed'}
  }

  try {
    const {orderTrackingCode, confirm = true} = JSON.parse(event.body)
    const rapidLeiClient = await getRapidLeiClient()

    const createStripeSubscription = async () => {
      const {
        data: {email},
      } = await getTrackingCodeRecord(orderTrackingCode)
      const customer = await getStripeCustomer({email})
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{plan: process.env.STRIPE_PLAN_ID}],
        expand: ['latest_invoice.payment_intent'],
        collection_method: 'charge_automatically',
        metadata: {
          orderTrackingCode,
        },
      })
      return subscription
    }

    const rdConfirmationResult = await rapidLeiClient.put(
      `/lei/orders/${orderTrackingCode}/confirmation/${confirm}`
    )

    if (rdConfirmationResult.error) {
      throw rdConfirmationResult.error
    }

    const subscription = await createStripeSubscription()

    await updateTrackingCodeRecord(orderTrackingCode, {
      subscriptionId: subscription.id,
    })

    if (subscription.error) {
      throw subscription.error
    }

    return {
      statusCode: 200,
      body: JSON.stringify(rdConfirmationResult.body),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (e) {
    console.error(e.message)
    return {
      statusCode: 500,
      body: JSON.stringify({error: true}),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }
}
