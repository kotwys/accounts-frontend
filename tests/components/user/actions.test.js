import expect from 'unexpected';
import sinon from 'sinon';

import { routeActions } from 'react-router-redux';

import request from 'services/request';
import { reset, RESET } from 'components/accounts/actions';

import {
    logout,
    setUser
} from 'components/user/actions';


describe('components/user/actions', () => {
    const getState = sinon.stub().named('store.getState');
    const dispatch = sinon.spy((arg) =>
        typeof arg === 'function' ? arg(dispatch, getState) : arg
    ).named('store.dispatch');

    const callThunk = function(fn, ...args) {
        const thunk = fn(...args);

        return thunk(dispatch, getState);
    };

    beforeEach(() => {
        dispatch.reset();
        getState.reset();
        getState.returns({});
        sinon.stub(request, 'get').named('request.get');
        sinon.stub(request, 'post').named('request.post');
    });

    afterEach(() => {
        request.get.restore();
        request.post.restore();
    });

    describe('#logout()', () => {
        beforeEach(() => {
            request.post.returns(Promise.resolve());
        });

        describe('user with jwt', () => {
            const token = 'iLoveRockNRoll';

            beforeEach(() => {
                getState.returns({
                    user: {
                        lang: 'foo'
                    },
                    accounts: {
                        active: {token},
                        available: [{token}]
                    }
                });
            });

            it('should post to /api/authentication/logout with user jwt', () =>
                callThunk(logout).then(() => {
                    expect(request.post, 'to have a call satisfying', [
                        '/api/authentication/logout', {}, {
                            token: expect.it('not to be empty')
                        }
                    ]);
                })
            );

            testChangedToGuest();
            testAccountsReset();
            testRedirectedToLogin();
        });

        describe('user without jwt', () => {
            // (a guest with partially filled user's state)
            // DEPRECATED
            beforeEach(() => {
                getState.returns({
                    user: {
                        lang: 'foo'
                    },
                    accounts: {
                        active: null,
                        available: []
                    }
                });
            });

            it('should not post to /api/authentication/logout', () =>
                callThunk(logout).then(() => {
                    expect(request.post, 'was not called');
                })
            );

            testChangedToGuest();
            testAccountsReset();
            testRedirectedToLogin();
        });

        function testChangedToGuest() {
            it('should change user to guest', () =>
                callThunk(logout).then(() => {
                    expect(dispatch, 'to have a call satisfying', [
                        setUser({
                            lang: 'foo',
                            isGuest: true
                        })
                    ]);
                })
            );
        }

        function testRedirectedToLogin() {
            it('should redirect to /login', () =>
                callThunk(logout).then(() => {
                    expect(dispatch, 'to have a call satisfying', [
                        routeActions.push('/login')
                    ]);
                })
            );
        }

        function testAccountsReset() {
            it(`should dispatch ${RESET}`, () =>
                callThunk(logout).then(() => {
                    expect(dispatch, 'to have a call satisfying', [
                        reset()
                    ]);
                })
            );
        }
    });
});
