import stripe from './stripe'

export default async function getStripeCustomer({
  email,
  firstName,
  lastName,
  paymentMethod,
}) {
  const {data: customerList} = await stripe.customers.list({
    email,
    limit: 1,
  })

  let customer = customerList && customerList[0]

  if (!firstName && !lastName && !paymentMethod && !customer) {
    throw new Error('Customer not found')
  }

  return (
    customer ||
    stripe.customers.create({
      name: `${firstName} ${lastName}`,
      email,
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    })
  )
}
