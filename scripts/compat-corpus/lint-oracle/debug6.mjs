import { ESLint } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import tsParser from '@typescript-eslint/parser';

const eslint = new ESLint({
  cwd: '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources',
  overrideConfigFile: true,
  overrideConfig: [
    ...sveltePlugin.configs['flat/base'],
    {
      files: ['**/*.svelte'],
      languageOptions: { parserOptions: { parser: tsParser } },
      rules: { 'svelte/no-navigation-without-base': 'warn' }
    }
  ]
});

const files = [
  '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/no-navigation-without-resolve/invalid/link-without-resolve01-input.svelte',
  '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/no-navigation-without-resolve/invalid/link-partial-resolve01-input.svelte',
];
for (const file of files) {
  const results = await eslint.lintFiles([file]);
  console.log(file.split('/').slice(-1)[0], ':', JSON.stringify(results[0].messages.map(m => ({ rule: m.ruleId, line: m.line, col: m.column }))));
}
