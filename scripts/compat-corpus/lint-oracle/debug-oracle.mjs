import { ESLint } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import tsParser from '@typescript-eslint/parser';

const testRule = {
  create(context) {
    return {
      Program() {
        const { parserServices } = context.sourceCode;
        const sc = parserServices?.svelteParseContext;
        process.stderr.write('svelteParseContext runes: ' + JSON.stringify(sc?.runes) + '\n');
      }
    };
  },
  meta: { type: 'problem', schema: [] }
};

const eslint = new ESLint({
  cwd: '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources',
  overrideConfigFile: true,
  overrideConfig: [
    ...sveltePlugin.configs['flat/base'],
    {
      files: ['**/*.svelte'],
      languageOptions: { parserOptions: { parser: tsParser } },
      plugins: { test: { rules: { runes: testRule } } },
      rules: { 
        'svelte/infinite-reactive-loop': 'warn',
        'test/runes': 'warn'
      }
    }
  ]
});
const file = '/Users/baseballyama/git/rsvelte-lint-corpus/compat/lint-corpus/sources/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/infinite-reactive-loop/invalid/queueMicrotask/test01-input.svelte';
const results = await eslint.lintFiles([file]);
console.log('infinite-reactive-loop findings:', JSON.stringify(results[0].messages.filter(m => m.ruleId === 'svelte/infinite-reactive-loop')));
