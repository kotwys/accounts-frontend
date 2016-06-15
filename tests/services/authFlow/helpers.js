/**
 * A helpers for testing states in isolation from AuthFlow
 */

export function bootstrap() {
    const context = {
        getState: sinon.stub(),
        run() {},
        setState() {},
        getCurrentPath: sinon.stub(),
        getQuery: sinon.stub(),
        navigate() {}
    };

    const mock = sinon.mock(context);
    mock.expects('run').never();
    mock.expects('navigate').never();
    mock.expects('setState').never();

    return {context, mock};
}

export function expectState(mock, state) {
    return mock.expects('setState').once().withExactArgs(
        sinon.match.instanceOf(state)
    );
}

export function expectNavigate(mock, route) {
    return mock.expects('navigate').once().withExactArgs(route);
}

export function expectRun(mock, ...args) {
    return mock.expects('run').once().withExactArgs(...args);
}
