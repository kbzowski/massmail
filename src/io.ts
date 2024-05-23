import fs from 'node:fs';

import { parse } from 'csv-parse/sync';
import mjml from 'mjml';

import { Config } from './config.js';
import { Value } from './types.js';

export const fileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch (err) {
        return false;
    }
};

export const loadCsv = async (config: Config): Promise<Record<string, Value>[]> => {
    const input = fs.readFileSync(config.input, 'utf-8');
    const data = parse(input, {
        columns: true,
        skip_empty_lines: true,
        delimiter: config.delimiter,
    });

    // check if all rows have email field show number which row is missing
    for (let i = 0; i < data.length; i++) {
        if (!data[i][config.fields.email]) {
            throw new Error(`Email field is missing on row ${i + 1}. Check config or csv file.`);
        }
    }

    return data;
};

export const readMjmlFile = async (config: Config): Promise<string> => {
    const source = mjml(fs.readFileSync(config.content, 'utf8'), {
        keepComments: false,
    });
    return source.html;
};

export const readTextFile = async (config: Config): Promise<string> => {
    return fs.readFileSync(config.content, 'utf8');
};
