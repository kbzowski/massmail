import meow from 'meow';

export const cli = meow(
    `
	Usage 
	  $ node . --config <<config file path>> [--test]

	Options
	  --config, -c  Config file path
	  --test, -t    Send only to the first user on the list
	  --limit, -l   Send only to this email (can be used multiple times). Email must be in the csv file.
	  --show, -s    Show addresses that would be sent to

	Examples
	  $ node . --config ./config.json --test
`,
    {
        importMeta: import.meta,
        allowUnknownFlags: false,
        inferType: true,
        autoHelp: true,
        flags: {
            config: {
                type: 'string',
                shortFlag: 'c',
                isRequired: true,
            },
            test: {
                type: 'boolean',
                shortFlag: 't',
                default: false,
            },
            limit: {
                type: 'string',
                shortFlag: 'l',
                isMultiple: true,
            },
            show: {
                type: 'boolean',
                shortFlag: 's',
                default: false,
            },
        },
    },
);

export type Flags = typeof cli.flags;
