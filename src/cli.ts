import meow from "meow";

export const cli = meow(`
	Usage 
	  $ node . --config <<config file path>> [--test]

	Options
	  --config, -c  Config file path
	  --test, -t  Send only to first user

	Examples
	  $ node . --config ./config.json --test
`, {
    importMeta: import.meta,
    allowUnknownFlags: false,
    inferType: true,
    autoHelp: true,
    flags: {
        config: {
            type: 'string',
            alias: 'c',
            isRequired: true
        },
        test: {
            type: 'boolean',
            alias: 't',
            default: false
        }
    }
});

export type Flags = typeof cli.flags;
