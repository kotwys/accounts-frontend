import React from 'react';

import styles from './panel.scss';
import icons from './icons.scss';

export function Panel(props) {
    var { title, icon } = props;

    if (icon) {
        icon = (
            <button className={styles.headerControl}>
                <span className={icons[icon]} />
            </button>
        );
    }

    if (title) {
        title = (
            <PanelHeader>
                {icon}
                {title}
            </PanelHeader>
        );
    }

    return (
        <div className={styles.panel}>
            {title}

            {props.children}
        </div>
    );
}

export function PanelHeader(props) {
    return (
        <div className={styles.header}>
            {props.children}
        </div>
    );
}

export function PanelBody(props) {
    return (
        <div className={styles.body}>
            {props.children}
        </div>
    );
}

export function PanelFooter(props) {
    return (
        <div className={styles.footer}>
            {props.children}
        </div>
    );
}

export function PanelError(props) {
    var { message } = props;

    return (
        <div className={styles.error}>
            <span className={styles.close} />
            {message}
        </div>
    );
}