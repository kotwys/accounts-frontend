import React, { Component } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'redux-simple-router';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter, PanelBodyHeader } from 'components/ui/Panel';
import { Input, Checkbox } from 'components/ui/Form';

import styles from './signIn.scss';
import messages from './SignIn.messages';

class Login extends Component {
    displayName = 'Login';

    render() {
        return (
            <div className={styles.signIn}>
                <Helmet title="Login" />

                <Panel title={<Message {...messages.signInTitle} />}>
                    <PanelBody>
                        <Input icon="envelope" type="email" placeholder="E-mail or username" />
                    </PanelBody>
                    <PanelFooter>
                        <button className={buttons.green} onClick={this.onSubmit}>
                            <Message {...messages.next} />
                        </button>
                    </PanelFooter>
                </Panel>
                <div className={styles.helpLinks}>
                    <a href="#">
                        <Message {...messages.forgotPassword} />
                    </a>
                </div>
            </div>
        );
    }

    onSubmit = (event) => {
        event.preventDefault();

        this.props.push('/password');
    };
}


export default connect(null, {
    push: routeActions.push
})(Login);
