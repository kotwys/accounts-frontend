import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Form, Button, Input, FormModel } from 'components/ui/form';

import messages from './PasswordRequestForm.messages';

export default class PasswordRequestForm extends Component {
    static displayName = 'PasswordRequestForm';

    static propTypes = {
        form: PropTypes.instanceOf(FormModel).isRequired,
        onSubmit: PropTypes.func.isRequired
    };

    render() {
        const {form} = this.props;

        return (
            <Form onSubmit={this.onSubmit}
                form={form}
            >
                <h2>
                    <Message {...messages.title} />
                </h2>

                <Input {...form.bindField('password')}
                    type="password"
                    required
                    autoFocus
                    color="green"
                    skin="light"
                    icon="key"
                    placeholder={messages.pleaseEnterPassword}
                />
                <Button color="green" label="OK" block />
            </Form>
        );
    }

    onSubmit = () => {
        this.props.onSubmit(this.props.form);
    };
}
