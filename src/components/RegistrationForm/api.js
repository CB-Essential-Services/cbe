import Frisbee from 'frisbee';

const {host, protocol} = typeof document !== 'undefined' ? document.location : {};

const client = new Frisbee({
  baseURI: `${host ? `${protocol}${host}` : ''}/.netlify/functions`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const placeOrder = async (payload) => {
  const {body} = await client.post('/placeOrder', {
    body: payload,
  });

  if (body.error) {
    return Promise.reject(body.error);
  }
  return body.order;
};

export const confirmOrder = async (payload) => {
  const {body} = await client.post('/confirm', {
    body: payload,
  });

  if (body.error) {
    throw new Error(body.error);
  }
  return body;
};

export const createBillingPortalSession = async (payload) => {
  const {body} = await client.post('/createBillingPortalSession', {
    body: payload,
  });

  if (body.error) {
    throw new Error(body.error);
  }
  return body;
};

export const getJurisdictions = async () => {
  const {body} = await client.get('/jurisdictions');
  return body;
};

export const getOrder = async (orderTrackingCode) => {
  const {body} = await client.get(`/order`, {
    params: {orderTrackingCode},
  });
  return body;
};

export const searchCompaniesByName = async ({jurisdiction, name}) => {
  const {body} = await client.get(`/search`, {
    params: {jurisdiction, name},
  });
  return body;
};

export const getCompany = async ({jurisdiction, number}) => {
  const {body} = await client.get(`/company`, {
    params: {jurisdiction, number},
  });
  return body;
};
