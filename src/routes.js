import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RootPage from 'pages/root/RootPage';
import IndexPage from 'pages/index/IndexPage';
import AuthPage from 'pages/auth/AuthPage';

import { authenticate } from 'components/user/actions';

import OAuthInit from 'components/auth/OAuthInit';
import Register from 'components/auth/Register';
import Login from 'components/auth/Login';
import Permissions from 'components/auth/Permissions';
import Activation from 'components/auth/Activation';
import Password from 'components/auth/Password';
import Logout from 'components/auth/Logout';
import PasswordChange from 'components/auth/PasswordChange';
import ForgotPassword from 'components/auth/ForgotPassword';
import Finish from 'components/auth/Finish';

import authFlow from 'services/authFlow';

export default function routesFactory(store) {
    const state = store.getState();
    if (state.user.token) {
        // authorizing user if it is possible
        store.dispatch(authenticate(state.user.token));
    }

    authFlow.setStore(store);

    const onEnter = {
        onEnter: ({location}, replace) => authFlow.handleRequest(location.pathname, replace)
    };

    return (
        <Route path="/" component={RootPage}>
            <IndexRoute component={IndexPage} />

            <Route path="oauth" component={OAuthInit} {...onEnter} />
            <Route path="logout" component={Logout} {...onEnter} />

            <Route path="auth" component={AuthPage}>
                <Route path="/login" components={new Login()} {...onEnter} />
                <Route path="/password" components={new Password()} {...onEnter} />
                <Route path="/register" components={new Register()} {...onEnter} />
                <Route path="/activation" components={new Activation()} {...onEnter} />
                <Route path="/oauth/permissions" components={new Permissions()} {...onEnter} />
                <Route path="/password-change" components={new PasswordChange()} {...onEnter} />
                <Route path="/forgot-password" components={new ForgotPassword()} {...onEnter} />
                <Route path="/oauth/finish" components={new Finish()} />
            </Route>
        </Route>
    );
}
