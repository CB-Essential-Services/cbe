import React, {useState} from 'react';
import {useQuery} from 'react-query';
import {useAsyncFn, useSearchParam} from 'react-use';

import {getOrder, confirmOrder, createBillingPortalSession} from './RegistrationForm/api';
import {format} from 'date-fns';

const Row = ({label, value}) => (
  <div>
    <label>{label}</label>
    <div>{value || 'N/A'}</div>
  </div>
);

const Address = ({title, data}) => (
  <section style={{flex: 1}}>
    <h3>{title}</h3>

    <Row label="First Address Line" value={data.firstAddressLine} />
    <Row label="Additional Address Line 1" value={data.addressLine1} />
    <Row label="City/Town" value={data.city} />
    <Row label="State/Region" value={data.state} />
    <Row label="Country" value={data.country} />
    <Row label="Postal Code" value={data.postalCode} />
  </section>
);

const ReferenceData = ({data}) => {
  return (
    <div>
      <section style={{marginBottom: '1rem'}}>
        <h3>Legal Entity Reference Data (LE-RD)</h3>

        <div style={{display: 'flex'}}>
          <div style={{flex: 1}}>
            <Row label="Legal Name" value={data.legalName} />
            <Row label="Legal Jurisdiction" value={data.legalJurisdiction} />
            <Row
              label="Entity Legal Form"
              value={`${data.entityLegalFormCode} - ${data.entityLegalForm}`}
            />
          </div>

          <div style={{flex: 1}}>
            <Row
              label="Registration Authority Entity ID"
              value={data.registrationAuthorityEntityId}
            />
            <Row
              label="Registration Authority"
              value={`${data.registrationAuthorityId} - ${data.registrationAuthority}`}
            />
            <Row label="Entity Legal Status" value={data.entityStatus} />
          </div>
        </div>
      </section>

      <div style={{display: 'flex'}}>
        <Address title="Legal Address" data={data.legalAddress} />

        <Address title="Headquarters Address" data={data.headquartersAddress} />
      </div>
    </div>
  );
};

const ConfirmReferenceData = ({status, orderTrackingCode, data}) => {
  const [confirmationState, confirm] = useAsyncFn(
    (approved) => confirmOrder({orderTrackingCode, confirm: approved}),
    [orderTrackingCode]
  );

  return (
    <div>
      <div style={{marginBottom: '1rem'}}>
        {confirmationState.loading && 'Loading...'}

        {confirmationState.value?.message}

        {confirmationState.error?.message}

        {!confirmationState.value && !confirmationState.loading && !confirmationState.error && (
          <div>
            Please verify the information below.
            <div>
              <button onClick={() => confirm(true)}>Verify</button>{' '}
              <button onClick={() => confirm(false)} className="button secondary">
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {data && <ReferenceData data={data} />}
    </div>
  );
};

const OrderStatus = () => {
  const orderTrackingCode = useSearchParam('orderTrackingCode');
  const [isFulfilled, setIsFulfilled] = useState(false);

  const MINUTE = 60 * 1000;
  const {data: order, error} = useQuery(orderTrackingCode, getOrder, {
    refetchOnWindowFocus: !isFulfilled,
    refetchInterval: !isFulfilled && 1 * MINUTE,
    onSuccess(data) {
      if (data?.orderStatus === 'complete') {
        setIsFulfilled(true);
      }
    },
  });

  const openBillingSession = () => {
    createBillingPortalSession({orderTrackingCode}).then((session) => {
      window.open(session.url);
    });
  };

  return (
    <div className="inner" style={{maxWidth: 700}}>
      <h1>Order Status</h1>

      {error && <div>An error occurred.</div>}

      {!order && <div>Loading...</div>}

      {order?.orderStatus === 'in_progress' && !order.preAuthorityCheckLeiNumber && (
        <div>
          Thank you for your order! It's currently in progress. You'll receive an email with updates
          soon.
        </div>
      )}

      {order?.orderStatus === 'in_progress' && order.preAuthorityCheckLeiNumber && (
        <div>{order.message}</div>
      )}

      {order?.orderStatus === 'complete' && (
        <div>
          <p>
            <button onClick={openBillingSession}>Manage Subscription</button>
          </p>
          <p>{order.message}</p>
          <p>Your LEI is {order.leiNumber}.</p>
          {order.nextRenewalDate && (
            <p>The next renewal date is {format(new Date(order.nextRenewalDate), 'PPP')}.</p>
          )}
        </div>
      )}

      {order?.orderStatus === 'stopped' && <div>Your application has been cancelled.</div>}

      {order?.orderStatus === 'pending_gui' && (
        <div>
          You rejected the reference data for your order. Please contact us if you'd like to resume
          your application.
        </div>
      )}

      {order?.referenceData && (
        <ConfirmReferenceData
          status={order.orderStatus}
          orderTrackingCode={orderTrackingCode}
          data={order.referenceData}
        />
      )}
    </div>
  );
};

export default OrderStatus;