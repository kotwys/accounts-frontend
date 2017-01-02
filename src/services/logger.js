import Raven from 'raven-js';

const isTest = process.env.__TEST__; // eslint-disable-line

const logger = {
    init({sentryCdn}) {
        if (sentryCdn) {
            Raven.config(sentryCdn, {
                logger: 'accounts-js-app',
                level: 'info',
                environment: process.env.APP_ENV, // eslint-disable-line
                release: process.env.__VERSION__, // eslint-disable-line
                shouldSendCallback: () => !isTest,
                dataCallback: (data) => {
                    if (!data.level) {
                        // log unhandled errors as info
                        data.level = 'info';
                    }

                    return data;
                }
            }).install();

            window.addEventListener('unhandledrejection',
                (event) => Raven.captureException(event.reason)
            );
        }
    },

    setUser(user) {
        Raven.setUserContext({
            username: user.username,
            email: user.email,
            id: user.id
        });
    }
};

[
    // 'fatal',
    'error',
    'warning',
    'info',
    'debug'
].forEach((level) => {
    const method = level === 'warning' ? 'warn' : level;

    logger[method] = (message, context) => {
        if (isTest) {
            return;
        }

        console[method](message, context);

        Raven.captureException(message, {
            level,
            extra: context
        });
    };
});

export default logger;
