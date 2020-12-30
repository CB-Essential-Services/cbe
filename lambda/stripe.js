import {getTrackingCodeRecord} from './helpers/fauna'
import getRapidLeiClient from './helpers/getRapidLeiClient'
import stripe from './helpers/stripe'

const renewLei = async (invoice) => {
  try {
    const rapidLeiClient = await getRapidLeiClient()
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription
    )
    let {orderTrackingCode, leiNumber} = subscription.metadata

    if (!leiNumber) {
      const {body} = await rapidLeiClient.get(
        `/lei/orders/${orderTrackingCode}/status`
      )
      leiNumber = body.leiNumber
    }

    if (!leiNumber) {
      throw new Error('No LEI number was assigned yet')
    }

    const result = await rapidLeiClient.post(`/leis/orders/renew`, {
      body: {
        leiNumber,
        isLevel1DataSame: true,
      },
    })

    if (result.body.failureReason) {
      throw new Error(result.body.failureReason)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({success: true}),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Could not renew LEI'}),
    }
  }
}

export async function handler(event, context) {
  try {
    // TODO Implement Webhook signatures for security
    // https://stripe.com/docs/webhooks/signatures
    // add process.env.STRIPE_WEBHOOK_SECRET
    const stripeEvent = JSON.parse(event.body)
    switch (stripeEvent.type) {
      case 'invoice.payment_succeeded':
        const invoice = stripeEvent.data.object
        // Don't wait for this to finish
        return renewLei(invoice)
      default:
        console.log(`Ignoring webhook for ${stripeEvent.type}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({success: true}),
    }
  } catch (e) {
    console.error(e.message)
    return {
      statusCode: 500,
      body: JSON.stringify({error: true}),
    }
  }
}
