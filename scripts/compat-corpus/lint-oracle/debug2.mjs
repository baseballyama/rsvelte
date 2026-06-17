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
      rules: { 'svelte/infinite-reactive-loop': 'warn' }
    }
  ]
});
const file = '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/infinite-reactive-loop/invalid/queueMicrotask/test01-input.svelte';
const results = await eslint.lintFiles([file]);
console.log('all findings:', JSON.stringify(results[0].messages, null, 2));
