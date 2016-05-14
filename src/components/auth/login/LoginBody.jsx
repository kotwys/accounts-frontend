import React from 'react';

import { Input } from 'components/ui/form';
import BaseAuthBody from 'components/auth/BaseAuthBody';

import messages from './Login.intl.json';

export default class LoginBody extends BaseAuthBody {
    static displayName = 'LoginBody';
    static panelId = 'login';

    autoFocusField = 'login';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <Input {...this.bindField('login')}
                    icon="envelope"
                    required
                    placeholder={messages.emailOrUsername}
                />
            </div>
        );
    }
}