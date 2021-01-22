/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, {useState, useMemo} from 'react'
import {useSetState} from 'react-use'
import PropTypes from 'prop-types'
import LeiRecord from './LeiRecord'
import styles from './LookupForm.module.css'
import useApi from './UseApi'

function LookupForm() {
  const searchOptions = [
    {label: 'Any', value: 'fulltext'},
    {label: 'LEI', value: 'lei'},
    {label: 'Entity Name', value: 'entity.names'}
  ]

  const [{searchBy, query}, setState] = useSetState({
    searchBy: searchOptions[0].value,
    query: null
  })
  const [params, setParams] = useState()
  const submit = (e) => {
    e.preventDefault()
    setParams({searchBy, query})
  }

  const {data: response, error} = useApi(params ? {key: '/lei-records', ...params} : null)
  const {data, meta} = response || {}

  const [activeEntry, setActiveEntry] = useState()

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.field}>
        <label>Field: </label>
        <select value={searchBy} onChange={(e) => setState({searchBy: e.target.value})}>
          {searchOptions.map(({label, value}) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <textarea
          onChange={(e) => setState({query: e.target.value})}
          onKeyDown={(e) => {
            if (e.keyCode === 13 && e.ctrlKey) {
              submit(e)
            }
          }}
          placeholder="Paste a list of search terms (comma separated or one per line)"
          value={query}
          autoFocus
          style={{width: '100%', fontFamily: 'inherit'}}
        />
      </div>

      <div>
        <button type="submit">Search</button> <small>(Ctrl + Enter)</small>
      </div>

      {params && !data && <div className={styles.emptyDetails}>Loading...</div>}

      {data && data.length > 0 && (
        <div className={styles.results}>
          <table className={styles.results}>
            <thead>
              <tr>
                <th>LEI</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row) => {
                const {lei, entity, registration} = row.attributes
                return (
                  <tr key={lei} onClick={() => setActiveEntry(row)} style={{cursor: 'pointer'}}>
                    <td>{lei}</td>
                    <td>{entity.legalName.name}</td>
                    <td>{registration.status}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && <LeiRecord record={activeEntry} />}
    </form>
  )
}

export default LookupForm
