import AbstractState from './AbstractState';
import PasswordState from './PasswordState';
import ForgotPasswordState from './ForgotPasswordState';

export default class LoginState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (user.email || user.username) {
            context.setState(new PasswordState());
        } else {
            context.navigate('/login');
        }
    }

    resolve(context, payload) {
        context.run('login', payload)
            .then(() => context.setState(new PasswordState()));
    }

    reject(context) {
        context.setState(new ForgotPasswordState());
    }
}
