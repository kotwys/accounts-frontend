import React, { Component } from 'react';
import { connect } from 'react-redux';

import { TransitionMotion, spring } from 'react-motion';

import AppInfo from 'components/auth/AppInfo';

import styles from './auth.scss';

const springConfig = [200, 20];

class AuthPage extends Component {
    displayName = 'AuthPage';

    render() {
        var appInfo = {
            name: 'TLauncher',
            description: `Лучший альтернативный лаунчер для Minecraft с большим количеством версий и их модификаций, а также возмоностью входа как с лицензионным аккаунтом, так и без него.`
        };

        var { path, children } = this.props;

        return (
            <div>
                <div className={styles.sidebar}>
                    <AppInfo {...appInfo} />
                </div>
                <div className={styles.content}>
                    <TransitionMotion
                        willEnter={this.willEnter}
                        willLeave={this.willLeave}
                        styles={{
                            [path]: {
                                children,
                                x: spring(0, springConfig)
                            }
                        }}
                    >
                        {(items) => (
                            <div style={{position: 'relative', overflow: 'hidden', width: '100%', height: '500px'}}>
                                {Object.keys(items).map((path) => {
                                    const {children, x} = items[path];

                                    const style = {
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateX(${x}%)`
                                    };

                                    return (
                                        <div key={path} style={style}>
                                            {children}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </TransitionMotion>
                    <TheDemo />
                </div>
            </div>
        );
    }

    willEnter(key, styles) {
        return {
            ...styles,
            x: spring(100, springConfig)
        };
    }

    willLeave(key, styles) {
        return {
            ...styles,
            x: spring(-100, springConfig)
        };
    }
}


import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import ReactHeight from 'react-height';

import panelStyles from 'components/ui/panel.scss';
import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter, PanelHeader } from 'components/ui/Panel';
import { Input, Checkbox } from 'components/ui/Form';

import messages from 'components/auth/Login.messages';
import regMessages from 'components/auth/Register.messages';
import {helpLinks as helpLinksStyles} from 'components/auth/helpLinks.scss';
import passwordMessages from 'components/auth/Password.messages';

const opacitySpringConfig = [200, 20];
const heightSpringConfig = [200, 18];
const transformSpringConfig = [500, 20];

// TODO: сделать более быстрый фейд на горизонтальном скролле

class TheDemo extends Component {
    state = {
        isFirstPage: true,
        height: {}
    };

    render() {
        var {isFirstPage} = this.state;

        var path = `page${isFirstPage ? '1' : '2'}`;

        return (
            <TransitionMotion
                styles={{
                    [path]: {
                        isFirstPage,
                        transformSpring: spring(0),
                        opacitySpring: spring(1)
                    },
                    common: {
                        heightSpring: spring(this.state.height[path] || 0, heightSpringConfig)
                    }
                }}
                willEnter={this.willEnter}
                willLeave={this.willLeave}
            >
                {(items) => {
                    var keys = Object.keys(items).filter((key) => key !== 'common');
                    return (
                        <div>
                            <Panel>
                                <PanelHeader>
                                    <div style={{
                                        position: 'relative',
                                        height: '59px',
                                        overflow: 'hidden'
                                    }}>
                                        {keys.map((key) => this.getHeader(key, items[key]))}
                                    </div>
                                </PanelHeader>
                                <PanelBody style={{
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'relative',
                                        height: `${items.common.heightSpring}px`
                                    }}>
                                        {keys.map((key) => this.getBody(key, items[key]))}
                                    </div>
                                </PanelBody>
                                <PanelFooter>
                                    <div style={{
                                        position: 'relative',
                                        height: '50px',
                                        overflow: 'hidden'
                                    }}>
                                        {keys.map((key) => this.getFooter(key, items[key]))}
                                    </div>
                                </PanelFooter>
                            </Panel>
                            <div className={helpLinksStyles} style={{position: 'relative', height: '20px'}}>
                                {keys.map((key) => this.getLinks(key, items[key]))}
                            </div>
                        </div>
                    );
                }}
            </TransitionMotion>
        );
    }

    willEnter = (key, styles) => {
        var sign = this.state.isFirstPage ? -1 : 1;

        return {
            ...styles,
            transformSpring: spring(sign * 100, transformSpringConfig),
            opacitySpring: spring(1, opacitySpringConfig)
        };
    };

    willLeave = (key, styles) => {
        var sign = this.state.isFirstPage ? -1 : 1;

        return {
            ...styles,
            transformSpring: spring(sign * -100, transformSpringConfig),
            opacitySpring: spring(0, opacitySpringConfig)
        };
    };

    getBody(key, props) {
        var {isFirstPage, transformSpring, opacitySpring} = props;

        var style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            WebkitTransform: `translateX(${transformSpring}%)`,
            transform: `translateX(${transformSpring}%)`,
            opacity: opacitySpring
        };

        return (isFirstPage ? (
            <ReactHeight key={`body${key}`} style={style} onHeightReady={this.updateHeight}>
                <Input icon="envelope" type="email" placeholder={messages.emailOrUsername} />
            </ReactHeight>
        ) : (
            <ReactHeight key={`body${key}`} style={style} onHeightReady={this.updateHeight}>
                <Input icon="user" color="blue" type="text" placeholder={regMessages.yourNickname} />
                <Input icon="envelope" color="blue" type="email" placeholder={regMessages.yourEmail} />
                <Input icon="key" color="blue" type="password" placeholder={regMessages.accountPassword} />
                <Input icon="key" color="blue" type="password" placeholder={regMessages.repeatPassword} />

                <Checkbox color="blue" label={
                    <Message {...regMessages.acceptRules} values={{
                        link: (
                            <a href="#">
                                <Message {...regMessages.termsOfService} />
                            </a>
                        )
                    }} />
                } />
            </ReactHeight>
        ));
    }

    updateHeight = (height) => {
        this.setState({
            height: {
                ...this.state.height,
                [`page${this.state.isFirstPage ? '1' : '2'}`]: height
            }
        });
    };

    getFooter(key, props) {
        var {isFirstPage, opacitySpring} = props;

        var style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: opacitySpring
        };

        return (isFirstPage ? (
            <button key={`footer${key}`} style={style} onClick={this.onSwitchViews} className={buttons.green}>
                <Message {...messages.next} />
            </button>
        ) : (
            <button key={`footer${key}`} style={style} onClick={this.onSwitchViews} className={buttons.blue}>
                <Message {...regMessages.signUpButton} />
            </button>
        ));
    }

    getHeader(key, props) {
        var {isFirstPage, transformSpring} = props;

        var style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
        };

        var scrollStyle = {
            WebkitTransform: `translateY(${transformSpring}%)`,
            transform: `translateY(${transformSpring}%)`
        };

        var sideScrollStyle = {
            position: 'relative',
            zIndex: 2,
            WebkitTransform: `translateX(${-Math.abs(transformSpring)}%)`,
            transform: `translateX(${-Math.abs(transformSpring)}%)`
        };

        return (isFirstPage ? (
            <div key={`header${key}`} style={style}>
                <Message {...messages.loginTitle}>
                    {(msg) => <div style={scrollStyle}>{msg}<Helmet title={msg} /></div>}
                </Message>
            </div>
        ) : (
            <div key={`header${key}`} style={style}>
                <button style={sideScrollStyle} onClick={this.onSwitchViews}  className={panelStyles.headerControl}>
                    <span className={icons.arrowLeft} />
                </button>
                <Message {...regMessages.registerTitle}>
                    {(msg) => <div style={scrollStyle}>{msg}<Helmet title={msg} /></div>}
                </Message>
            </div>
        ));
    }

    getLinks(key, props) {
        var {isFirstPage, opacitySpring} = props;

        var style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: opacitySpring
        };

        return (isFirstPage ? (
            <div key={`links${key}`} style={style}>
                <a href="#">
                    <Message {...passwordMessages.forgotPassword} />
                </a>
            </div>
        ) : (
            <div key={`links${key}`} style={style}>
                <a href="#">
                    {'test 123'}
                </a>
            </div>
        ));
    }

    onSwitchViews = (event) => {
        event.preventDefault();

        this.setState({
            isFirstPage: !this.state.isFirstPage
        });
    };
}

export default connect((state) => ({
    path: state.routing.location.pathname
}))(AuthPage);
