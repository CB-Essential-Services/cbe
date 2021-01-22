import useSWR from 'swr'
import fetch from 'unfetch'

// const BASE = new URL('https://leilookup.gleif.org/api/v2/leirecords')
const BASE = 'https://api.gleif.org/api/v1'

const fetchLei = (path, searchBy = '', query = '') => {
  const url = new URL(`${BASE}${path}`)
  const params = {}
  if (searchBy) {
    params[`filter[${searchBy}]`] = query.trim().replace(/\n/g, ',')
  }
  url.search = new URLSearchParams(params).toString()

  return fetch(url).then((r) => r.json())
}

export default function UseApi(options) {
  const {key, searchBy, query} = options || {}

  const params = key ? [key.replace(BASE, ''), searchBy, query].filter((x) => x) : null

  return useSWR(params, fetchLei)
}
