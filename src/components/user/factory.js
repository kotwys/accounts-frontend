import { changeLang } from 'components/user/actions';
import { authenticate, logoutStrangers } from 'components/accounts/actions';

import request from 'services/request';
import bearerHeaderMiddleware from './middlewares/bearerHeaderMiddleware';
import refreshTokenMiddleware from './middlewares/refreshTokenMiddleware';

let promise;

/**
 * Initializes User state with the fresh data
 *
 * @param {object} store - redux store
 *
 * @return {Promise} - a promise, that resolves in User state
 */
export function factory(store) {
    if (promise) {
        return promise;
    }

    request.addMiddleware(refreshTokenMiddleware(store));
    request.addMiddleware(bearerHeaderMiddleware(store));

    promise = Promise.resolve()
        .then(() => store.dispatch(logoutStrangers()))
        .then(() => {
            const {user, accounts} = store.getState();

            if (accounts.active || user.token) {
                // authorizing user if it is possible
                return store.dispatch(authenticate(accounts.active || user));
            }

            return Promise.reject();
        })
        .catch(() => {
            // the user is guest or user authentication failed
            const {user} = store.getState();

            // auto-detect guest language
            return store.dispatch(changeLang(user.lang));
        });

    return promise;
}
