import meow from 'meow';

export const cli = meow(
    `
	Usage 
	  $ node . --config <<config file path>> [--test]

	Options
	  --config, -c  Config file path
	  --test, -t  Send only to first user
	  --limit, -l  Send only to this email (can be used multiple times)

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
                alias: 'c',
                isRequired: true,
            },
            test: {
                type: 'boolean',
                alias: 't',
                default: false,
            },
            limit: {
                type: 'string',
                alias: 'l',
                isMultiple: true,
            },
        },
    },
);

export type Flags = typeof cli.flags;
