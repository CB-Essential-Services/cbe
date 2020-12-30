const openCorporates = require('opencorporates')(process.env.OPENCORPORATES_KEY)

export async function handler(event, context) {
  try {
    const params = event.queryStringParameters

    const name = params.name
    const jurisdictionCode = params.jurisdiction.toLowerCase().replace('-', '_')

    const results = await openCorporates.companies.search(name, {
      jurisdictionCode,
      inactive: false,
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(results),
    }
  } catch (e) {
    console.error(e.message)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({error: true}),
    }
  }
}
