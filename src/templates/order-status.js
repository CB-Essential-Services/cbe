import React from 'react';

import {Layout} from '../components/index';
import OrderStatus from '../components/OrderStatus';

export default class Landing extends React.Component {
  render() {
    return (
      <Layout {...this.props}>
        <div className="outer">
          <OrderStatus />
        </div>
      </Layout>
    );
  }
}