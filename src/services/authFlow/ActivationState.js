import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ResendActivationState from './ResendActivationState';

export default class ActivationState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (user.isActive) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/activation');
        }
    }

    resolve(context, payload) {
        context.run('activate', payload)
            .then(() => context.setState(new CompleteState()));
    }

    reject(context) {
        context.setState(new ResendActivationState());
    }
}
