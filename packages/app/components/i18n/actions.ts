import { Action as ReduxAction } from 'redux';

import i18n from 'app/services/i18n';
import { Action as AppAction } from 'app/types';

export function setLocale(desiredLocale: string): AppAction<Promise<string>> {
    return async (dispatch) => {
        const locale = i18n.detectLanguage(desiredLocale);

        dispatch(_setLocale(locale));

        return locale;
    };
}

interface SetAction extends ReduxAction {
    type: 'i18n:setLocale';
    payload: {
        locale: string;
    };
}

function _setLocale(locale: string): SetAction {
    return {
        type: 'i18n:setLocale',
        payload: {
            locale,
        },
    };
}

export type Action = SetAction;
