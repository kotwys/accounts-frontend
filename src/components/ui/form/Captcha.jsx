import React, { PropTypes } from 'react';

import captcha from 'services/captcha';
import { skins, SKIN_DARK } from 'components/ui';

import styles from './form.scss';
import FormInputComponent from './FormInputComponent';

export default class Captcha extends FormInputComponent {
    static displayName = 'Captcha';

    static propTypes = {
        skin: PropTypes.oneOf(skins)
    };

    static defaultProps = {
        skin: SKIN_DARK
    };

    componentDidMount() {
        captcha.render(this.el, {
            skin: this.props.skin,
            onSetCode: this.setCode
        });
    }

    render() {
        return (
            <div>
                <div ref={this.setEl} className={styles.captcha} />
                {this.renderError()}
            </div>
        );
    }

    getValue() {
        return this.state && this.state.code;
    }

    setCode = (code) => this.setState({code});
}
