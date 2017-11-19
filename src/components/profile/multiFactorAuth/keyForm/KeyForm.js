// @flow
import React from 'react';

import classNames from 'classnames';

import { FormattedMessage as Message } from 'react-intl';

import { ImageLoader } from 'components/ui/loader';
import profileForm from 'components/profile/profileForm.scss';
import messages from '../MultiFactorAuth.intl.json';

import styles from './key-form.scss';

export default function KeyForm({secret, qrCodeSrc}: {
    secret: string,
    qrCodeSrc: string
}) {
    // we are using invisible symbol (\u2063) as a placeholder till we get actual secret
    const formattedSecret = formatSecret(secret) || '\u2063';

    return (
        <div className={profileForm.formBody}>
            <div className={profileForm.formRow}>
                <p className={profileForm.description}>
                    <Message {...messages.scanQrCode} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <div className={styles.qrCode}>
                    <ImageLoader ratio={1} src={qrCodeSrc} alt={secret} />
                </div>
            </div>

            <div className={profileForm.formRow}>
                <p className={classNames(styles.manualDescription, profileForm.description)}>
                    <span className={styles.or}>
                        <Message {...messages.or} />
                    </span>
                    <Message {...messages.enterKeyManually} />
                </p>
            </div>

            <div className={profileForm.formRow}>
                <div className={styles.key}>
                    {formattedSecret}
                </div>
            </div>

            <div className={profileForm.formRow}>
                <p className={profileForm.description}>
                    <Message {...messages.whenKeyEntered} />
                </p>
            </div>
        </div>
    );
}

function formatSecret(secret: string): string {
    return (secret.match(/.{1,4}/g) || []).join(' ');
}
