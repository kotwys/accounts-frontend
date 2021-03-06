import 'app/polyfills';
import '@testing-library/jest-dom';

if (!window.localStorage) {
    window.localStorage = {
        getItem(key) {
            return this[key] || null;
        },
        setItem(key, value) {
            this[key] = value;
        },
        removeItem(key) {
            delete this[key];
        },
    };

    window.sessionStorage = {
        ...window.localStorage,
    };
}
