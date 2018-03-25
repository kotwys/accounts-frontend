// @flow
import React from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';

import FormComponent from 'components/ui/form/FormComponent';

import styles from 'components/profile/profileForm.scss';

import messages from './ProfileForm.intl.json';

export class BackButton extends FormComponent<{
    to: string,
}> {
    static displayName = 'BackButton';

    static defaultProps = {
        to: '/',
    };

    render() {
        const { to } = this.props;

        return (
            <Link className={styles.backButton} to={to} title={this.formatMessage(messages.back)}>
                <span className={styles.backIcon} />
                <span className={styles.backText}>
                    <Message {...messages.back} />
                </span>
            </Link>
        );
    }
}
