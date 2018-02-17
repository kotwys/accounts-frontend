// @flow
import { getJwtPayload } from 'functions';
import { sessionStorage } from 'services/localStorage';
import authentication from 'services/api/authentication';
import { relogin as navigateToLogin } from 'components/auth/actions';
import { updateUser, setGuest } from 'components/user/actions';
import { setLocale } from 'components/i18n/actions';
import { setAccountSwitcher } from 'components/auth/actions';
import { getActiveAccount } from 'components/accounts/reducer';
import logger from 'services/logger';

import {
    add,
    remove,
    activate,
    reset,
    updateToken
} from './actions/pure-actions';
import type { Account, State as AccountsState } from './reducer';

type Dispatch = (action: Object) => Promise<*>;

type State = {
    accounts: AccountsState,
    auth: {
        oauth?: {
            clientId?: string
        },
    },
};

export { updateToken };

/**
 * @param {Account|object} account
 * @param {string} account.token
 * @param {string} account.refreshToken
 *
 * @return {function}
 */
export function authenticate(account: Account | {
    token: string,
    refreshToken: ?string,
}) {
    const {token, refreshToken} = account;
    const email = account.email || null;

    return (dispatch: Dispatch, getState: () => State): Promise<Account> =>
        authentication.validateToken({token, refreshToken})
            .catch((resp = {}) => {
                // all the logic to get the valid token was failed,
                // looks like we have some problems with token
                // lets redirect to login page
                if (typeof email === 'string') {
                    // TODO: we should somehow try to find email by token
                    dispatch(relogin(email));
                }

                return Promise.reject(resp);
            })
            .then(({token, refreshToken, user}) => ({
                user: {
                    isGuest: false,
                    ...user
                },
                account: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    token,
                    refreshToken
                }
            }))
            .then(({user, account}) => {
                const {auth} = getState();

                dispatch(add(account));
                dispatch(activate(account));
                dispatch(updateUser(user));

                // TODO: probably should be moved from here, because it is a side effect
                logger.setUser(user);

                if (!account.refreshToken) {
                    // mark user as stranger (user does not want us to remember his account)
                    sessionStorage.setItem(`stranger${account.id}`, 1);
                }

                if (auth && auth.oauth && auth.oauth.clientId) {
                    // if we authenticating during oauth, we disable account chooser
                    // because user probably has made his choise now
                    // this may happen, when user registers, logs in or uses account
                    // chooser panel during oauth
                    dispatch(setAccountSwitcher(false));
                }

                return dispatch(setLocale(user.lang))
                    .then(() => account);
            });
}

/**
 * Checks the current user's token exp time. Supposed to be used before performing
 * any api request
 *
 * @see components/user/middlewares/refreshTokenMiddleware
 *
 * @return {function}
 */
export function ensureToken() {
    return (dispatch: Dispatch, getState: () => State): Promise<void> => {
        const {token} = getActiveAccount(getState()) || {};

        try {
            const SAFETY_FACTOR = 300; // ask new token earlier to overcome time dissynchronization problem
            const jwt = getJwtPayload(token);

            if (jwt.exp - SAFETY_FACTOR < Date.now() / 1000) {
                return dispatch(requestNewToken());
            }
        } catch (err) {
            logger.warn('Refresh token error: bad token', {
                token
            });

            dispatch(relogin());

            return Promise.reject(new Error('Invalid token'));
        }

        return Promise.resolve();
    };
}

/**
 * Checks whether request `error` is an auth error and tries recover from it by
 * requesting a new auth token
 *
 * @see components/user/middlewares/refreshTokenMiddleware
 *
 * @param  {object} error
 *
 * @return {function}
 */
export function recoverFromTokenError(error: ?{
    status: number,
    message: string,
}) {
    return (dispatch: Dispatch, getState: () => State): Promise<void> => {
        if (error && error.status === 401) {
            const activeAccount = getActiveAccount(getState());

            if (activeAccount && activeAccount.refreshToken) {
                if ([
                    'Token expired',
                    'Incorrect token',
                    'You are requesting with an invalid credential.'
                ].includes(error.message)) {
                    // request token and retry
                    return dispatch(requestNewToken());
                }

                logger.error('Unknown unauthorized response', {
                    error
                });
            }

            // user's access token is outdated and we have no refreshToken
            // or something unexpected happend
            // in both cases we resetting all the user's state
            dispatch(relogin());
        }

        return Promise.reject(error);
    };
}

/**
 * Requests new token and updates state. In case, when token can not be updated,
 * it will redirect user to login page
 *
 * @return {function}
 */
export function requestNewToken() {
    return (dispatch: Dispatch, getState: () => State): Promise<void> => {
        const {refreshToken} = getActiveAccount(getState()) || {};

        if (!refreshToken) {
            dispatch(relogin());

            return Promise.resolve();
        }

        return authentication.requestToken(refreshToken)
            .then(({ token }) => {
                dispatch(updateToken(token));
            })
            .catch((resp) => {
                // all the logic to get the valid token was failed,
                // looks like we have some problems with token
                // lets redirect to login page
                dispatch(relogin());

                return Promise.reject(resp);
            });
    };
}

/**
 * Remove one account from current user's account list
 *
 * @param {Account} account
 *
 * @return {function}
 */
export function revoke(account: Account) {
    return (dispatch: Dispatch, getState: () => State): Promise<void> => {
        const accountToReplace: ?Account = getState().accounts.available.find(({id}) => id !== account.id);

        if (accountToReplace) {
            return dispatch(authenticate(accountToReplace))
                .then(() => {
                    authentication.logout(account);
                    dispatch(remove(account));
                });
        }

        return dispatch(logoutAll());
    };
}

export function relogin(email?: string) {
    return (dispatch: Dispatch, getState: () => State) => {
        const activeAccount = getActiveAccount(getState());

        if (!email && activeAccount) {
            email = activeAccount.email;
        }

        dispatch(navigateToLogin(email || null));
    };
}

export function logoutAll() {
    return (dispatch: Dispatch, getState: () => State): Promise<void> => {
        dispatch(setGuest());

        const {accounts: {available}} = getState();

        available.forEach((account) =>
            authentication.logout(account)
                .catch(() => {
                    // we don't care
                })
        );

        dispatch(reset());
        dispatch(relogin());

        return Promise.resolve();
    };
}

/**
 * Logouts accounts, that was marked as "do not remember me"
 *
 * We detecting foreign accounts by the absence of refreshToken. The account
 * won't be removed, until key `stranger${account.id}` is present in sessionStorage
 *
 * @return {function}
 */
export function logoutStrangers() {
    return (dispatch: Dispatch, getState: () => State): Promise<void> => {
        const {accounts: {available}} = getState();
        const activeAccount = getActiveAccount(getState());

        const isStranger = ({refreshToken, id}: Account) => !refreshToken && !sessionStorage.getItem(`stranger${id}`);

        if (available.some(isStranger)) {
            const accountToReplace = available.filter((account) => !isStranger(account))[0];

            if (accountToReplace) {
                available.filter(isStranger)
                    .forEach((account) => {
                        dispatch(remove(account));
                        authentication.logout(account);
                    });

                if (activeAccount && isStranger(activeAccount)) {
                    return dispatch(authenticate(accountToReplace));
                }
            } else {
                return dispatch(logoutAll());
            }
        }

        return Promise.resolve();
    };
}
