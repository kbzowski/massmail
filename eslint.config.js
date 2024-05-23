import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const linter = [
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ...eslintPluginPrettierRecommended,
        rules: {
            'prettier/prettier': [
                'warn',
                {
                    singleQuote: true,
                    trailingComma: 'all',
                    tabWidth: 4,
                    bracketSpacing: true,
                    printWidth: 100,
                },
            ],
        },
    },
    {
        plugins: {
            'simple-import-sort': eslintPluginSimpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
];

export default linter;
