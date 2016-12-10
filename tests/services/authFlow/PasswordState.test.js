import sinon from 'sinon';

import PasswordState from 'services/authFlow/PasswordState';
import CompleteState from 'services/authFlow/CompleteState';
import LoginState from 'services/authFlow/LoginState';
import ForgotPasswordState from 'services/authFlow/ForgotPasswordState';

import { bootstrap, expectState, expectNavigate, expectRun } from './helpers';

describe('PasswordState', () => {
    let state;
    let context;
    let mock;

    beforeEach(() => {
        state = new PasswordState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /password', () => {
            context.getState.returns({
                user: {isGuest: true},
                auth: {login: 'foo'}
            });

            expectNavigate(mock, '/password');

            state.enter(context);
        });

        it('should transition to complete if not guest', () => {
            context.getState.returns({
                user: {isGuest: false},
                auth: {login: null}
            });

            expectState(mock, CompleteState);

            state.enter(context);
        });
    });

    describe('#resolve', () => {
        it('should call login with login and password', () => {
            const expectedLogin = 'foo';
            const expectedPassword = 'bar';
            const expectedRememberMe = true;

            context.getState.returns({
                auth: {
                    login: expectedLogin
                }
            });

            expectRun(
                mock,
                'login',
                sinon.match({
                    login: expectedLogin,
                    password: expectedPassword,
                    rememberMe: expectedRememberMe,
                })
            ).returns(Promise.resolve());

            state.resolve(context, {password: expectedPassword, rememberMe: expectedRememberMe});
        });

        it('should transition to complete state on successfull login', () => {
            const promise = Promise.resolve();
            const expectedLogin = 'login';
            const expectedPassword = 'password';

            context.getState.returns({
                auth: {
                    login: expectedLogin
                }
            });

            mock.expects('run').returns(promise);
            expectState(mock, CompleteState);

            state.resolve(context, {password: expectedPassword});

            return promise;
        });
    });

    describe('#reject', () => {
        it('should transition to forgot password state', () => {
            expectState(mock, ForgotPasswordState);

            state.reject(context);
        });
    });

    describe('#goBack', () => {
        it('should transition to login state', () => {
            expectRun(mock, 'setLogin', null);
            expectState(mock, LoginState);

            state.goBack(context);
        });
    });
});
