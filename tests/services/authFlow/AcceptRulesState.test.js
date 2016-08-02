import AcceptRulesState from 'services/authFlow/AcceptRulesState';
import CompleteState from 'services/authFlow/CompleteState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('AcceptRulesState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new AcceptRulesState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /accept-rules', () => {
            context.getState.returns({
                user: {
                    shouldAcceptRules: true,
                    isGuest: false
                }
            });

            expectNavigate(mock, '/accept-rules');

            state.enter(context);
        });

        it('should transition to complete state if rules accepted', () => {
            context.getState.returns({
                user: {
                    shouldAcceptRules: false,
                    isGuest: false
                }
            });

            expectState(mock, CompleteState);

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call acceptRules', () => {
            expectRun(mock, 'acceptRules').returns({then() {}});

            state.resolve(context);
        });

        it('should transition to complete state on success', () => {
            const promise = Promise.resolve();

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.resolve(context);

            return promise;
        });

        it('should NOT transition to complete state on fail', () => {
            const promise = Promise.reject();

            mock.expects('run').returns(promise);
            mock.expects('setState').never();

            state.resolve(context);

            return promise.catch(mock.verify.bind(mock));
        });
    });

    describe('#reject', () => {
        it('should logout', () => {
            expectRun(mock, 'logout');

            state.reject(context);
        });
    });
});
