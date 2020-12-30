import React from 'react';
import Checkout from '../components/checkout';

import {Layout} from '../components/index';

export default class Landing extends React.Component {
    render() {
        return (
            <Layout {...this.props}>
                <div className="outer">
                <div style={{width: '55%', maxWidth: '40rem', margin: '0 auto'}}>
                    <h3>Extend LEI: Transfer and Renew <span role="img" aria-label="counterclockwise arrows">🔄</span></h3>
                <p>Move a registered Legal Entity Identifer under our management. <br></br>Then gain the power of automated renewals. </p>
                    <Checkout />
                </div>
                </div>
            </Layout>
        );
    }
}