// @flow
function InternalServerError(error: Error | string | Object, resp?: Response | Object) {
    error = error || {};

    this.name = 'InternalServerError';
    this.message = 'InternalServerError';
    this.error = error;
    this.stack = (new Error()).stack;

    if (resp) {
        this.originalResponse = resp;
    }

    if (error.message) {
        this.message = error.message;
    }

    if (typeof error === 'string') {
        this.message = error;
    } else {
        this.error = error;
        Object.assign(this, error);
    }
}

InternalServerError.prototype = Object.create(Error.prototype);
InternalServerError.prototype.constructor = InternalServerError;

export default InternalServerError;
