import request from 'services/request';

export default {
    register({
        email = '',
        username = '',
        password = '',
        rePassword = '',
        rulesAgreement = false,
        lang = '',
        captcha = ''
    }) {
        return request.post(
            '/api/signup',
            {email, username, password, rePassword, rulesAgreement, lang, captcha}
        );
    },

    activate({key = ''}) {
        return request.post(
            '/api/signup/confirm',
            {key}
        );
    },

    resendActivation({email = '', captcha}) {
        return request.post(
            '/api/signup/repeat-message',
            {email, captcha}
        );
    }
};
