import gs from 'gradient-string';
import inquirer from 'inquirer';
import { Table } from 'voici.js';

import { cli, Flags } from './cli.js';
import { loadConfig, validateConfig } from './config.js';
import { loadCsv, readMjmlFile, readTextFile } from './io.js';
import { sendToUsers, summary } from './sender.js';

const banner = () => {
    const text = `
███    ███  █████  ███████ ███████ ███    ███  █████  ██ ██      
████  ████ ██   ██ ██      ██      ████  ████ ██   ██ ██ ██      
██ ████ ██ ███████ ███████ ███████ ██ ████ ██ ███████ ██ ██      
██  ██  ██ ██   ██      ██      ██ ██  ██  ██ ██   ██ ██ ██      
██      ██ ██   ██ ███████ ███████ ██      ██ ██   ██ ██ ███████                                                                                                         
    `;

    const coolString = gs.instagram.multiline(text);
    console.log(coolString);
};

const continueOrExit = async () => {
    const ans = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'send',
            message: 'Are you sure you want to send emails?',
            prefix: '💡',
        },
    ]);
    if (!ans.send) {
        console.log('👋', 'Bye!');
        process.exit(0);
    }
};

const main = async (flags: Flags) => {
    try {
        banner();
        const config = await loadConfig(flags.config);
        await validateConfig(config);
        let users = await loadCsv(config);
        users = flags.test ? users.slice(0, 1) : users;

        if (flags.limit && flags.limit.length > 0) {
            users = users.filter((user) =>
                flags.limit?.includes(user[config.fields.email] as string),
            );
        }

        if (flags.show) {
            console.log('🧑', 'Users:');
            const table = new Table(users);
            table.print();
        }

        let content = '';
        if (config.content_type === 'mjml') {
            content = await readMjmlFile(config);
        } else if (config.content_type === 'text') {
            content = await readTextFile(config);
        }

        summary(users, config, flags.test);
        await continueOrExit();

        await sendToUsers(users, content, config);
    } catch (err) {
        const error = err as Error;
        console.error('💀', error.message);
        process.exit(1);
    }
};

void main(cli.flags);
