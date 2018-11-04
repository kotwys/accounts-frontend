import expect from 'unexpected';
import sinon from 'sinon';

import request from 'services/request';
import { InternalServerError, RequestAbortedError } from 'services/request';

describe('services/request', () => {
    beforeEach(() => {
        sinon.stub(window, 'fetch').named('fetch');
    });

    afterEach(() => {
        window.fetch.restore();
    });

    describe('InternalServerError', () => {
        it('should wrap json errors', () => {
            const resp = new Response('bad resp format', { status: 200 });

            fetch.returns(Promise.resolve(resp));

            return expect(request.get('/foo'), 'to be rejected').then((error) => {
                expect(error, 'to be an', InternalServerError);
                expect(error.originalResponse, 'to be', resp);
                expect(error.message, 'to contain', 'Unexpected token');
            });
        });

        it('should wrap 5xx errors', () => {
            const resp = new Response('{}', { status: 500 });

            fetch.returns(Promise.resolve(resp));

            return expect(request.get('/foo'), 'to be rejected').then((error) => {
                expect(error, 'to be an', InternalServerError);
                expect(error.originalResponse, 'to be', resp);
            });
        });

        it('should wrap aborted errors', () => {
            const resp = new Response('{}', { status: 0 });

            fetch.returns(Promise.resolve(resp));

            return expect(request.get('/foo'), 'to be rejected').then((error) => {
                expect(error, 'to be an', RequestAbortedError);
                expect(error.error, 'to be', resp);
            });
        });

        it('should wrap "Failed to fetch" errors', () => {
            const resp = new TypeError('Failed to fetch');

            fetch.returns(Promise.resolve(resp));

            return expect(request.get('/foo'), 'to be rejected').then((error) => {
                expect(error, 'to be an', RequestAbortedError);
                expect(error.message, 'to be', resp.message);
                expect(error.error, 'to be', resp);
            });
        });
    });

    describe('#buildQuery', () => {
        it('should build query', () => {
            const data = {
                notSet: undefined,
                notSet2: null,
                numeric: 1,
                complexString: 'sdfgs sdfg ',
                positive: true,
                negative: false
            };
            const expectedQs
                = 'notSet=&notSet2=&numeric=1&complexString=sdfgs%20sdfg%20&positive=1&negative=0';

            expect(request.buildQuery(data), 'to equal', expectedQs);
        });
    });
});
