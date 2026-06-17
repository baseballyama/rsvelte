import { RuleTester } from 'eslint';
import rule from './node_modules/eslint-plugin-svelte/lib/rules/infinite-reactive-loop.js';
import * as svelteParser from 'svelte-eslint-parser';

const tester = new RuleTester({
  languageOptions: { parser: svelteParser }
});

tester.run('infinite-reactive-loop', rule, {
  valid: [],
  invalid: [{
    filename: 'test.svelte',
    code: `<script>
\tconst queueMicrotask2 = queueMicrotask;
\tlet a = 0;

\t$: {
\t\tqueueMicrotask(() => {
\t\t\ta = a + 1;
\t\t});
\t}

\t$: {
\t\tqueueMicrotask2(() => {
\t\t\ta = a + 1;
\t\t});
\t}
</script>`,
    errors: [{ message: 'Possibly it may occur an infinite reactive loop.' }]
  }]
});
console.log('PASSED');
