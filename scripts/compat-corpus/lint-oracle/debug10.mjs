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
      rules: { 'svelte/prefer-svelte-reactivity': 'warn' }
    }
  ]
});
const file = '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/prefer-svelte-reactivity/invalid/url/hash01-input.svelte';
const results = await eslint.lintFiles([file]);
console.log('findings:', JSON.stringify(results[0].messages.map(m => ({ rule: m.ruleId, line: m.line, col: m.column }))));
