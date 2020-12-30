import faunadb, {query as q} from 'faunadb'

const client = new faunadb.Client({secret: process.env.FAUNA_KEY})

const getTrackingCodeRecord = async (code) => {
  try {
    const record = await client.query(
      q.Get(q.Match(q.Index('order_tracking_code'), code))
    )

    return record
  } catch (err) {
    return null
  }
}

const updateTrackingCodeRecord = async (code, data) => {
  const currentRecord = await getTrackingCodeRecord(code)

  const action = q[currentRecord ? 'Update' : 'Create']
  const ref = currentRecord ? currentRecord.ref : q.Collection('orders')
  const result = await client.query(
    action(ref, {data: {...data, orderTrackingCode: code}})
  )

  if (result.data) {
    return result.data
  }

  throw new Error(`Tracking code record ${code} could not be updated`)
}

export {getTrackingCodeRecord, updateTrackingCodeRecord}
