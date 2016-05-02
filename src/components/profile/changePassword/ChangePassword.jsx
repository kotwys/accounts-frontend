import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import { Input, Button, Checkbox, Form } from 'components/ui/form';
import FormModel from 'models/Form';

import styles from 'components/profile/profileForm.scss';
import messages from './ChangePassword.messages';

export default class ChangePassword extends Component {
    static displayName = 'ChangePassword';

    static propTypes = {
        onSubmit: PropTypes.func.isRequired
    };

    form = new FormModel();

    render() {
        const {form} = this;

        return (
            <Form onSubmit={this.onFormSubmit}>
                <div className={styles.contentWithBackButton}>
                    <Link className={styles.backButton} to="/" />

                    <div className={styles.form}>
                        <div className={styles.formBody}>
                            <Message {...messages.changePasswordTitle}>
                                {(pageTitle) => (
                                    <h3 className={styles.title}>
                                        <Helmet title={pageTitle} />
                                        {pageTitle}
                                    </h3>
                                )}
                            </Message>

                            <div className={styles.formRow}>
                                <p className={styles.description}>
                                    <Message {...messages.changePasswordDescription} />
                                    <br/>
                                    <b>
                                        <Message {...messages.achievementLossWarning} />
                                    </b>
                                </p>
                            </div>

                            <div className={styles.formRow}>
                                <Input {...form.bindField('newPassword')}
                                    type="password"
                                    required
                                    skin="light"
                                    label={messages.newPasswordLabel}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <p className={styles.description}>
                                    <Message {...messages.passwordRequirements} />
                                </p>
                            </div>

                            <div className={styles.formRow}>
                                <Input {...form.bindField('newRePassword')}
                                    type="password"
                                    required
                                    skin="light"
                                    label={messages.repeatNewPasswordLabel}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <Checkbox {...form.bindField('logoutAll')}
                                    defaultChecked
                                    skin="light"
                                    label={messages.logoutOnAllDevices}
                                />
                            </div>
                        </div>

                        <Button color="green" block label={messages.changePasswordButton} />
                    </div>
                </div>
            </Form>
        );
    }

    onFormSubmit = () => {
        this.props.onSubmit(this.form.serialize());
    };
}