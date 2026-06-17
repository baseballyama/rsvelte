import { ESLint } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import tsParser from '@typescript-eslint/parser';
import fs from 'fs';

// Read the source
const file = '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/infinite-reactive-loop/invalid/queueMicrotask/test01-input.svelte';
const source = fs.readFileSync(file, 'utf8');
console.log('Source:', JSON.stringify(source.slice(0, 200)));

// Run without any conditions gate to verify it can find something
const eslint2 = new ESLint({
  cwd: '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources',
  overrideConfigFile: true,
  overrideConfig: [
    ...sveltePlugin.configs['flat/base'],
    {
      files: ['**/*.svelte'],
      languageOptions: { parserOptions: { parser: tsParser } },
      rules: { 
        'svelte/infinite-reactive-loop': 'warn',
        'svelte/no-reactive-reassign': 'warn',  // any other rule
      }
    }
  ]
});
const results = await eslint2.lintFiles([file]);
console.log('findings:', JSON.stringify(results[0].messages.map(m => ({ rule: m.ruleId, line: m.line, msg: m.message.slice(0,50) })), null, 2));
