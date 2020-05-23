/* eslint-env node */
/* eslint-disable no-console */
import fs from 'fs';
import { sync as globSync } from 'glob';
import { sync as mkdirpSync } from 'mkdirp';
import chalk from 'chalk';
import prompt from 'prompt';
import localesMap from 'app/i18n';

const MESSAGES_PATTERN = `${__dirname}/../../build/messages/**/*.json`;
const LANG_DIR = `${__dirname}/../app/i18n`;
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LANGS = [DEFAULT_LOCALE, ...Object.keys(localesMap)];

interface MessageDescriptor {
    id: string | number;
    defaultMessage: string;
}

/**
 * Aggregates the default messages that were extracted from the app's
 * React components via the React Intl Babel plugin. An error will be thrown if
 * there are messages in different components that use the same `id`. The result
 * is a flat collection of `id: message` pairs for the app's default locale.
 */
let idToFileMap: Record<string, Array<string>> = {};
let duplicateIds: Array<string | number> = [];
const collectedMessages = globSync(MESSAGES_PATTERN)
    .map<[string, Array<MessageDescriptor>]>((filename) => [filename, JSON.parse(fs.readFileSync(filename, 'utf8'))])
    .reduce<Record<string, string>>((collection, [file, descriptors]) => {
        descriptors.forEach(({ id, defaultMessage }) => {
            if (collection[id]) {
                duplicateIds.push(id);
            }

            collection[id] = defaultMessage;
            idToFileMap[id] = (idToFileMap[id] || []).concat(file);
        });

        return collection;
    }, {});

if (duplicateIds.length) {
    console.log('\nFound duplicated ids:');
    duplicateIds.forEach((id) => console.log(`${chalk.yellow(id)}:\n - ${idToFileMap[id].join('\n - ')}\n`));
    console.log(chalk.red('Please correct the errors above to proceed further!'));

    process.exit(1);
}

duplicateIds = [];
idToFileMap = {};

/**
 * Making a diff with the previous DEFAULT_LOCALE version
 */
const defaultMessagesPath = `${LANG_DIR}/${DEFAULT_LOCALE}.json`;
const isNotMarked = (value: string) => value.slice(0, 2) !== '--';

const prevMessages = readJSON<Record<string, string>>(defaultMessagesPath);
const prevMessagesMap = Object.entries(prevMessages).reduce((acc, [key, value]) => {
    if (acc[value]) {
        acc[value].push(key);
    } else {
        acc[value] = [key];
    }

    return acc;
}, {} as Record<string, Array<string>>);

const keysToAdd = Object.keys(collectedMessages).filter((key) => !prevMessages[key]);
const keysToRemove: Array<string> = Object.keys(prevMessages)
    .filter((key) => !collectedMessages[key])
    .filter(isNotMarked);
const keysToUpdate: Array<string> = Object.entries(prevMessages).reduce(
    (acc, [key, message]) => acc.concat(collectedMessages[key] && collectedMessages[key] !== message ? key : []),
    [] as Array<string>,
);

const keysToRename: Array<[string, string]> = [];
// detect keys to rename, mutating keysToAdd and keysToRemove
[...keysToAdd].forEach((toKey) => {
    const keys = prevMessagesMap[collectedMessages[toKey]] || [];
    const fromKey = keys.find((key) => keysToRemove.indexOf(key) > -1);

    if (fromKey) {
        keysToRename.push([fromKey, toKey]);
        keysToRemove.splice(keysToRemove.indexOf(fromKey), 1);
        keysToAdd.splice(keysToAdd.indexOf(toKey), 1);
    }
});

if (!keysToAdd.length && !keysToRemove.length && !keysToUpdate.length && !keysToRename.length) {
    console.log(chalk.green('Everything is up to date!'));
    process.exit();
}

console.log(chalk.magenta(`The diff relative to default locale (${DEFAULT_LOCALE}) is:`));

if (keysToRemove.length) {
    console.log('The following keys will be removed:');
    console.log([chalk.red('\n - '), keysToRemove.join(chalk.red('\n - ')), '\n'].join(''));
}

if (keysToAdd.length) {
    console.log('The following keys will be added:');
    console.log([chalk.green('\n + '), keysToAdd.join(chalk.green('\n + ')), '\n'].join(''));
}

if (keysToUpdate.length) {
    console.log('The following keys will be updated:');
    console.log([chalk.yellow('\n @ '), keysToUpdate.join(chalk.yellow('\n @ ')), '\n'].join(''));
}

if (keysToRename.length) {
    console.log('The following keys will be renamed:\n');
    console.log(keysToRename.reduce((str, pair) => [str, pair[0], chalk.yellow(' -> '), pair[1], '\n'].join(''), ''));
}

prompt.start();
prompt.get(
    {
        properties: {
            apply: {
                description: 'Apply changes? [Y/n]',
                pattern: /^y|n$/i,
                message: 'Please enter "y" or "n"',
                default: 'y',
                before: (value) => value.toLowerCase() === 'y',
            },
        },
    },
    (err, resp) => {
        console.log('\n');

        if (err || !resp.apply) {
            return console.log(chalk.red('Aborted'));
        }

        buildLocales();

        console.log(chalk.green('All locales was successfuly built'));
    },
);

function buildLocales() {
    mkdirpSync(LANG_DIR);

    SUPPORTED_LANGS.map((lang) => {
        const destPath = `${LANG_DIR}/${lang}.json`;
        const newMessages = readJSON<Record<string, string>>(destPath);

        keysToRename.forEach(([fromKey, toKey]) => {
            newMessages[toKey] = newMessages[fromKey];
            delete newMessages[fromKey];
        });
        keysToRemove.forEach((key) => {
            delete newMessages[key];
        });
        keysToUpdate.forEach((key) => {
            newMessages[`--${key}`] = newMessages[key];
            newMessages[key] = collectedMessages[key];
        });
        keysToAdd.forEach((key) => {
            newMessages[key] = collectedMessages[key];
        });

        const sortedKeys: Array<string> = Object.keys(newMessages).sort((key1, key2) => {
            key1 = key1.replace(/^-+/, '');
            key2 = key2.replace(/^-+/, '');

            return key1 < key2 || !isNotMarked(key1) ? -1 : 1;
        });

        const sortedNewMessages = sortedKeys.reduce<typeof newMessages>((acc, key) => {
            acc[key] = newMessages[key];

            return acc;
        }, {});

        fs.writeFileSync(destPath, `${JSON.stringify(sortedNewMessages, null, 4)}\n`);
    });
}

function readJSON<T extends {}>(destPath: string): T {
    try {
        return JSON.parse(fs.readFileSync(destPath, 'utf8'));
    } catch (err) {
        console.log(chalk.yellow(`Can't read ${destPath}. The new file will be created.`), `(${err.message})`);
    }

    return {} as T;
}
