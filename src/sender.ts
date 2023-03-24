import chalk from 'chalk';
import { convert } from 'html-to-text';
import { inflect } from 'inflection';
import nodemailer from 'nodemailer';

import { Config } from './config.js';
import { sleep } from './helpers.js';
import { Value } from './types.js';

export const personalizeContent = async (
    content: string,
    fields: Record<string, Value>,
): Promise<string> => {
    let result = content;
    for (const [key, value] of Object.entries(fields)) {
        const stringValue = value?.toString().trim() ?? '';
        result = result.replaceAll(`{${key}}`, stringValue);
    }
    return result;
};

export const createTransport = (config: Config) => {
    return nodemailer.createTransport(config.smtp);
};

export const summary = (users: Record<string, Value>[], config: Config, isTest: boolean) => {
    if (isTest) {
        const firstEmail = users[0][config.fields.email];
        console.log(
            '⚠️',
            chalk.redBright(`Working in test mode. Sending only to the first user: ${firstEmail}`),
        );
    } else {
        console.log('ℹ️', `Sending: ${users.length} ${inflect('email', users.length)}`);
    }
    console.log('ℹ️', `Sleeping: ${config.sleepSeconds} seconds between emails`);
    console.log('ℹ️', `From: ${config.smtp.from}`);
    console.log('ℹ️', `Email subject: ${config.subject}`);
    console.log('ℹ️', `Email content: ${config.content}`);
};

const printUser = (user: Record<string, Value>, config: Config) => {
    const fn = config.fields.firstName;
    const ln = config.fields.lastName;
    const e = config.fields.email;

    if (user[fn] && user[ln]) {
        const name = `${user[fn]} ${user[ln]}`;
        console.log('➡️', `${name} <${user[e]}>`);
    } else {
        console.log('➡️', user[e]);
    }
};

export const sendToUsers = async (
    users: Record<string, Value>[],
    content: string,
    config: Config,
): Promise<void> => {
    const transporter = createTransport(config);

    for (const user of users) {
        printUser(user, config);
        await sleep(config.sleepSeconds);
        const email = user[config.fields.email] as string;
        const personalizedContent = await personalizeContent(content, user);
        const personalizedText = convert(personalizedContent);

        const mailOptions = {
            from: config.smtp.from,
            to: email,
            subject: config.subject,
            html: personalizedContent,
            text: personalizedText,
        };

        await transporter.sendMail(mailOptions);
    }
};
