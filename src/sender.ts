import chalk from 'chalk';
import { convert } from 'html-to-text';
import { inflect } from 'inflection';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import ora, { Ora } from 'ora';

import { Config } from './config.js';
import { sleep } from './helpers.js';
import { Value } from './types.js';

export const personalizeContent = async (
    content: string,
    fields: Record<string, Value>,
): Promise<string> => {
    let result = content;
    const keyValues = Object.entries(fields);
    for (const field of keyValues) {
        const key = field[0];
        const value: string = field[1] as string;
        const stringValue = value?.toString().trim() ?? '';
        result = _.replace(result, '{' + key + '}', stringValue);
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

const printUser = (
    spinner: Ora,
    user: Record<string, Value>,
    config: Config,
    current: number,
    total: number,
) => {
    const fn = config.fields.firstName;
    const ln = config.fields.lastName;
    const e = config.fields.email;

    if (fn && ln && user[fn] && user[ln]) {
        const name = `${user[fn]} ${user[ln]}`;
        spinner.text = `Sending to ${name} <${user[e]}> (${current}/${total})`;
        // console.log('➡️', `${name} <${user[e]}>`);
    } else {
        spinner.text = `Sending to ${user[e]} (${current}/${total})`;
        // console.log('➡️', user[e]);
    }
};

export const sendToUsers = async (
    users: Record<string, Value>[],
    content: string,
    config: Config,
): Promise<void> => {
    const transporter = createTransport(config);

    const mailOptions: Mail.Options = {
        from: config.smtp.from,
        subject: config.subject,
        replyTo: config.smtp.replyTo,
    };

    const total = users.length;
    const spinner = ora(' Task started').start();
    for (const [i, user] of users.entries()) {
        printUser(spinner, user, config, i + 1, total);
        await sleep(config.sleepSeconds);
        const email = user[config.fields.email] as string;
        const pContent = await personalizeContent(content, user);

        mailOptions.to = email;
        mailOptions.html = config.content_type == 'mjml' ? pContent : undefined;
        mailOptions.text = config.content_type == 'mjml' ? convert(pContent) : pContent;

        await transporter.sendMail(mailOptions);
    }
    spinner.succeed(' Task completed');
};
