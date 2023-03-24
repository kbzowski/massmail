import {Config} from './config.js';
import nodemailer from 'nodemailer';
import {convert} from "html-to-text";
import {sleep} from "./helpers.js";
import {inflect} from "inflection";
import chalk from "chalk";

export const personalizeContent = async (content: string, fields: string[]): Promise<string> => {
    let result = content;
    for (const [key, value] of Object.entries(fields)) {
        result = result.replaceAll(`{${key}}`, value.trim());
    }
    return result;
}

export const createTransport = (config: Config) => {
    return nodemailer.createTransport(config.smtp);
}

export const summary = (users: string[][], config: Config, isTest: boolean) => {
    if (isTest) {
        console.log('⚠️', chalk.redBright('Working in test mode. Sending only to the first user.'));
    } else {
        console.log('ℹ️', `Sending: ${users.length} ${inflect('email', users.length)}`);
    }
    console.log('ℹ️', `Sleeping: ${config.sleepSeconds} seconds between emails`);
    console.log('ℹ️', `From: ${config.smtp.from}`);
    console.log('ℹ️', `Email subject: ${config.subject}`);
    console.log('ℹ️', `Email content: ${config.content}`);
}

export const sendToUsers = async (users: string[][], content: string, config: Config): Promise<void> => {
    const transporter = createTransport(config);

    for (const user of users) {
        await sleep(config.sleepSeconds);
        const email = user[config.fields.email as any];
        const name = `${user[config.fields.firstName as any]} ${user[config.fields.lastName as any]}`
        const personalizedContent = await personalizeContent(content, user);
        const personalizedText = convert(personalizedContent);


        const mailOptions = {
            from: config.smtp.from,
            to: email,
            subject: config.subject,
            html: personalizedContent,
            text: personalizedText
        };

        console.log('➡️', `${name} <${email}>`);
        await transporter.sendMail(mailOptions);
    }
}
