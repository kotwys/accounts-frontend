import PromiseMiddlewareLayer from './PromiseMiddlewareLayer';

const middlewareLayer = new PromiseMiddlewareLayer();

export default {
    /**
     * @param {string} url
     * @param {object} data
     *
     * @return {Promise}
     */
    post(url, data) {
        return doFetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: buildQuery(data)
        });
    },

    /**
     * @param {string} url
     * @param {object} data
     *
     * @return {Promise}
     */
    get(url, data) {
        if (typeof data === 'object') {
            const separator = url.indexOf('?') === -1 ? '?' : '&';
            url += separator + buildQuery(data);
        }

        return doFetch(url);
    },

    /**
     * Serializes object into encoded key=value presentation
     *
     * @param {object} data
     *
     * @return {string}
     */
    buildQuery,

    /**
     * @param {object} middleware
     * @param {function} [middleware.before] - a function({url, options}), that will be called before executing request.
     *                                         It will get data object {url, options} as an argument and should return
     *                                         Promise, that will resolve into new data object
     * @param {function} [middleware.then] - a function(resp), that will be called on successful request result. It will
     *                                       get response as an argument and should return a Promise that resolves to
     *                                       the new response
     * @param {function} [middleware.catch] - a function(resp, restart), that will be called on request fail. It will
     *                                        get response and callback to restart request as an arguments and should
     *                                        return a Promise that resolves to the new response.
     */
    addMiddleware(middleware) {
        middlewareLayer.add(middleware);
    }
};


const checkStatus = (resp) => Promise[resp.status >= 200 && resp.status < 300 ? 'resolve' : 'reject'](resp);
const toJSON = (resp) => resp.json().then((json) => {
    json.originalResponse = resp;

    return json;
});
const rejectWithJSON = (resp) => toJSON(resp).then((resp) => {throw resp;});
const handleResponseSuccess = (resp) => Promise[resp.success || typeof resp.success === 'undefined' ? 'resolve' : 'reject'](resp);

function doFetch(url, options = {}) {
    // NOTE: we are wrapping fetch, because it is returning
    // Promise instance that can not be pollyfilled with Promise.prototype.finally

    options.headers = options.headers || {};
    options.headers.Accept = 'application/json';

    return middlewareLayer.run('before', {url, options})
        .then(({url, options}) => fetch(url, options))
        .then(checkStatus)
        .then(toJSON, rejectWithJSON)
        .then(handleResponseSuccess)
        .then((resp) => middlewareLayer.run('then', resp))
        .catch((resp) => middlewareLayer.run('catch', resp, () => doFetch(url, options)))
        ;
}

/**
 * Converts specific js values to query friendly values
 *
 * @param {any} value
 *
 * @return {string}
 */
function convertQueryValue(value) {
    if (typeof value === 'undefined') {
        return '';
    }

    if (value === true) {
        return '1';
    }

    if (value === false) {
        return '0';
    }

    return value;
}

/**
 * Serializes object into encoded key=value presentation
 *
 * @param {object} data
 *
 * @return {string}
 */
function buildQuery(data = {}) {
    return Object.keys(data)
        .map(
            (keyName) =>
                [keyName, convertQueryValue(data[keyName])]
                    .map(encodeURIComponent)
                    .join('=')
        )
        .join('&')
        ;
}