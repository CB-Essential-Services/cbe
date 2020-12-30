import React from 'react';

import {Layout} from '../components/index';
import RegistrationForm from '../components/RegistrationForm';

export default class Landing extends React.Component {
    render() {
        return (
            <Layout {...this.props}>
                <div className="outer">
                    <RegistrationForm />
                </div>
            </Layout>
        );
    }
}