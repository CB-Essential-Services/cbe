import _ from 'lodash'
import getRapidLeiClient from './helpers/getRapidLeiClient'
import countryLookup from 'country-code-lookup'
import stateCodes from 'us-state-codes'

const getJurisdictionsFromRapidLei = async () => {
  const rapidLeiClient = await getRapidLeiClient()
  const {body: result} = await rapidLeiClient.get('/jurisdictions')

  const countries = result.countries
    .filter((x) => x.confidenceLevel > 5)
    .map((x) => ({
      value: x.jurisdiction,
      label: countryLookup.byIso(x.jurisdiction).country,
    }))

  const states = result.states
    .filter((x) => x.confidenceLevel > 0 && x.jurisdiction.startsWith('US'))
    .map((x) => ({
      value: x.jurisdiction,
      label: stateCodes.getStateNameByStateCode(x.jurisdiction.split('-')[1]),
    }))

  return {countries, states}
}

export async function handler(event, context) {
  const {countries, states} = await getJurisdictionsFromRapidLei()
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      {
        label: 'States',
        options: states,
      },
      {
        label: 'Countries',
        options: countries,
      },
    ]),
  }
}
