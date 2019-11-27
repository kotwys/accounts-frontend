import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'components/ui/form';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import styles from './activation.scss';
import messages from './Activation.intl.json';

export default class ActivationBody extends BaseAuthBody {
  static displayName = 'ActivationBody';
  static panelId = 'activation';

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        key: PropTypes.string,
      }),
    }),
  };

  autoFocusField =
    this.props.match.params && this.props.match.params.key ? null : 'key';

  render() {
    const { key } = this.props.match.params;
    const { email } = this.context.user;

    return (
      <div>
        {this.renderErrors()}

        <div className={styles.description}>
          <div className={styles.descriptionImage} />

          <div className={styles.descriptionText}>
            {email ? (
              <Message
                {...messages.activationMailWasSent}
                values={{
                  email: <b>{email}</b>,
                }}
              />
            ) : (
              <Message {...messages.activationMailWasSentNoEmail} />
            )}
          </div>
        </div>
        <div className={styles.formRow}>
          <Input
            {...this.bindField('key')}
            color="blue"
            center
            required
            value={key}
            readOnly={!!key}
            autoComplete="off"
            placeholder={messages.enterTheCode}
          />
        </div>
      </div>
    );
  }
}
