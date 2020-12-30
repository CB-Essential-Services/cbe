import qs from 'querystring'

import stripe from './helpers/stripe'
import sendgridMail from './helpers/sendgridMail'
import sendgridClient from './helpers/sendgridClient'
import extractHostFromContext from './helpers/extractHostFromContext'

import {getTrackingCodeRecord, updateTrackingCodeRecord} from './helpers/fauna'
import getRapidLeiClient from './helpers/getRapidLeiClient'
import {capitalize} from 'lodash'

export async function handler(event, context) {
  try {
    const {orderTrackingCode, orderStatus} = qs.parse(event.body)
    console.log(orderTrackingCode, orderStatus)
    const record = await getTrackingCodeRecord(orderTrackingCode)

    if (!record?.data) {
      throw new Error('Tracking record not found')
    }

    const {
      email,
      orderStatus: oldOrderStatus,
      subscriptionId,
      ...orderRecord
    } = record.data

    if (!email) {
      throw new Error('No email address found for order')
    }

    if (oldOrderStatus === orderStatus) {
      return {
        statusCode: 200,
        body: 'Status already handled',
      }
    }

    const rapidLeiClient = await getRapidLeiClient()
    const orderResult = await rapidLeiClient.get(
      `/lei/orders/${orderTrackingCode}/status`
    )

    const templateId = await sendgridClient
      .request({
        method: 'GET',
        url: '/v3/templates?generations=dynamic',
      })
      .then(([response, body]) => {
        const template = body.templates.find((x) => x.name === orderStatus)
        if (template?.versions?.length > 0) {
          return template.id
        }
      })

    if (!templateId) {
      return {
        statusCode: 200,
        body: 'No email template found',
      }
    }

    await Promise.all([
      updateTrackingCodeRecord(orderTrackingCode, orderResult.body),
      subscriptionId &&
        stripe.subscriptions.update(subscriptionId, {
          metadata: orderResult.body,
        }),
    ])

    const host = extractHostFromContext(context)
    const dynamicTemplateData = {
      ...orderRecord,
      orderTrackingCode,
      orderStatus,
      link: `${host}/status?orderTrackingCode=${orderTrackingCode}`,
      ...orderResult.body,
    }

    dynamicTemplateData.firstName = capitalize(dynamicTemplateData.firstName)
    dynamicTemplateData.lastName = capitalize(dynamicTemplateData.lastName)

    await sendgridMail.send({
      to: email,
      templateId,
      dynamicTemplateData,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({success: true}),
    }
  } catch (error) {
    if (error?.response?.body?.errors) {
      console.log(error.response.body.errors)
    }

    console.log(error)

    return {
      statusCode: 500,
      body: JSON.stringify({error: error.message}),
    }
  }
}
