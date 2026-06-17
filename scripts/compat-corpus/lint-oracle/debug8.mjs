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
      rules: { 'svelte/valid-prop-names-in-kit-pages': 'warn' }
    }
  ]
});
const file = '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/valid-prop-names-in-kit-pages/invalid/svelte5-children-in-page/+page.svelte';
const results = await eslint.lintFiles([file]);
console.log('findings:', JSON.stringify(results[0].messages.map(m => ({ rule: m.ruleId, line: m.line, col: m.column }))));
