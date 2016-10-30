/**
 * Applies Bearer header for all requests
 *
 * @param {object} store - redux store
 * @param {function} store.getState
 *
 * @return {object} - request middleware
 */
export default function bearerHeaderMiddleware({getState}) {
    return {
        before(req) {
            let {token} = getState().user;

            if (req.options.token) {
                token = req.options.token;
            }

            if (token) {
                req.options.headers.Authorization = `Bearer ${token}`;
            }

            return req;
        }
    };
}
