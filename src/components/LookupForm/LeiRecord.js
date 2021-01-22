/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, {useState, useMemo} from 'react';
import styles from './LookupForm.module.css';
import {format} from 'date-fns';

import UseApi from './UseApi';
import LookupForm from './LookupForm';

const Address = ({address}) => (
  <pre>
    {[
      ...address.addressLines,
      address.city,
      address.region,
      address.country,
      address.postalCode
    ].join('\n')}
  </pre>
)

const ManagingLou = ({record}) => {
  const {
    attributes: {entity}
  } = record
  const {legalName} = entity
  return (
    <div>
      <h2>Managing LOU</h2>

      <div>{legalName.name}</div>
    </div>
  )
}

export default function LeiRecord({record}) {
  if (!record) {
    return <div className={styles.emptyDetails}>Select an entity to see more details</div>
  }

  const {attributes, relationships} = record
  const {lei, entity, registration, bic} = attributes
  const {
    legalName,
    legalAddress,
    otherNames,
    headquartersAddress,
    registeredAt,
    registeredAs,
    legalForm,
    associatedEntity,
    status,
    expiration
  } = entity

  const {data: managingLouResponse = {}} = UseApi({
    key: relationships['managing-lou'].links.related
  })
  const {data: managingLou} = managingLouResponse

  return (
    <div className={styles.leiRecord}>
      <h1>{entity.legalName.name}</h1>
      <div>
        <small>
          {lei} - {status}
        </small>
      </div>

      <div>
        <h2>Other Names</h2>

        <pre>{otherNames.map((x) => x.name).join('\n')}</pre>
      </div>

      <div>
        <h2>Registration</h2>

        <pre>
          {[
            'Initial Date: ' + format(new Date(registration.initialRegistrationDate), 'PPPppp'),
            'Last Update: ' + format(new Date(registration.lastUpdateDate), 'PPPppp'),
            'Status: ' + registration.status,
            'Next Renewal Date: ' + format(new Date(registration.nextRenewalDate), 'PPPppp'),
            'Corroboration Level: ' + registration.corroborationLevel
          ].join('\n')}
        </pre>
      </div>

      <div>
        <h2>Address</h2>
        <Address address={legalAddress} />
      </div>

      <div>
        <h2>Headquarters Address</h2>
        <Address address={headquartersAddress} />
      </div>

      {managingLou && <ManagingLou record={managingLou} />}
    </div>
  )
}
