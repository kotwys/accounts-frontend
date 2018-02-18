// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { resetAuth } from 'components/auth/actions';
import { withRouter } from 'react-router';
import { FormattedMessage as Message } from 'react-intl';
import { Route, Link, Switch } from 'react-router-dom';
import Helmet from 'react-helmet';
import classNames from 'classnames';

import AuthPage from 'pages/auth/AuthPage';
import ProfilePage from 'pages/profile/ProfilePage';
import RulesPage from 'pages/rules/RulesPage';
import PageNotFound from 'pages/404/PageNotFound';

import { ScrollIntoView } from 'components/ui/scroll';
import PrivateRoute from 'containers/PrivateRoute';
import AuthFlowRoute from 'containers/AuthFlowRoute';
import Userbar from 'components/userbar/Userbar';
import PopupStack from 'components/ui/popup/PopupStack';
import loader from 'services/loader';
import type { User } from 'components/user';

import styles from './root.scss';
import messages from './RootPage.intl.json';

class RootPage extends Component<{
    user: User,
    isPopupActive: bool,
    onLogoClick: Function,
    location: {
        pathname: string
    }
}> {
    componentDidMount() {
        this.onPageUpdate();
    }

    componentDidUpdate() {
        this.onPageUpdate();
    }

    onPageUpdate() {
        loader.hide();
    }

    render() {
        const props = this.props;
        const {user, isPopupActive, onLogoClick} = this.props;
        const isRegisterPage = props.location.pathname === '/register';

        if (document && document.body) {
            document.body.style.overflow = isPopupActive ? 'hidden' : '';
        }

        return (
            <div className={styles.root}>
                <Helmet>
                    <html lang={user.lang} />
                </Helmet>

                <ScrollIntoView top />

                <div id="view-port" className={classNames(styles.viewPort, {
                    [styles.isPopupActive]: isPopupActive
                })}>
                    <div className={styles.header} data-e2e-toolbar>
                        <div className={styles.headerContent}>
                            <Link to="/" className={styles.logo} onClick={onLogoClick}>
                                <Message {...messages.siteName} />
                            </Link>
                            <div className={styles.userbar}>
                                <Userbar {...props}
                                    guestAction={isRegisterPage ? 'login' : 'register'}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.body}>
                        <Switch>
                            <PrivateRoute path="/profile" component={ProfilePage} />
                            <Route path="/404" component={PageNotFound} />
                            <Route path="/rules" component={RulesPage} />
                            <AuthFlowRoute exact path="/" component={ProfilePage} />
                            <AuthFlowRoute path="/" component={AuthPage} />
                            <Route component={PageNotFound} />
                        </Switch>
                    </div>
                </div>
                <PopupStack />
            </div>
        );
    }
}

export default withRouter(connect((state) => ({
    user: state.user,
    isPopupActive: state.popup.popups.length > 0
}), {
    onLogoClick: resetAuth
})(RootPage));
