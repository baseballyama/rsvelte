import { RuleTester } from 'eslint';
import rule from './node_modules/eslint-plugin-svelte/lib/rules/prefer-svelte-reactivity.js';
import * as svelteParser from 'svelte-eslint-parser';

const tester = new RuleTester({
  languageOptions: { parser: svelteParser }
});

tester.run('prefer-svelte-reactivity', rule, {
  valid: [],
  invalid: [{
    filename: 'test.svelte',
    code: `<script>
  const variable = new URL("https://svelte.dev/");
  variable.hash = "anchor";
</script>

{variable}`,
    errors: [{ messageId: 'mutableURLUsed' }]
  }]
});
console.log('PASSED');
