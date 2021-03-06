import '@testing-library/cypress/add-commands';

import { account1, account2 } from '../fixtures/accounts';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const accountsMap = {
    default: account1,
    default2: account2,
};

Cypress.Commands.add('login', async ({ accounts, updateState = true, rawApiResp = false }) => {
    const accountsData = await Promise.all(
        accounts.map(async (account) => {
            let credentials;

            if (account) {
                credentials = accountsMap[account];

                if (!credentials) {
                    throw new Error(`Unknown account name: ${account}`);
                }
            }

            const resp = await fetch('/api/authentication/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: `${new URLSearchParams({
                    login: credentials.login,
                    password: credentials.password,
                    rememberMe: '1',
                })}`,
            }).then((rawResp) => rawResp.json());

            if (rawApiResp) {
                return resp;
            }

            return {
                id: credentials.id,
                username: credentials.username,
                password: credentials.password,
                email: credentials.email,
                token: resp.access_token,
                refreshToken: resp.refresh_token,
            };
        }),
    );

    if (updateState) {
        const state = createState(accountsData);

        localStorage.setItem('redux-storage', JSON.stringify(state));
    }

    return { accounts: accountsData };
});

function createState(accounts) {
    return {
        accounts: {
            available: accounts,
            active: accounts[0].id,
        },
        user: {
            id: 102,
            uuid: 'e49cafdc-6e0c-442d-b608-dacdb864ee34',
            username: 'test',
            token: '',
            email: 'admin@udf.su',
            maskedEmail: '',
            avatar: '',
            lang: 'en',
            isActive: true,
            isOtpEnabled: true,
            shouldAcceptRules: false,
            passwordChangedAt: 1478961317,
            hasMojangUsernameCollision: true,
            isGuest: false,
            registeredAt: 1478961317,
            elyProfileLink: 'http://ely.by/u102',
        },
    };
}
