import { Linter } from 'eslint';
import * as svelte from 'eslint-plugin-svelte';
import * as parser from 'svelte-eslint-parser';

const linter = new Linter();
const cfg = [{
  files: ['**/*.svelte'],
  languageOptions: { parser },
  plugins: { svelte },
  processor: 'svelte/svelte',
  rules: { 'svelte/comment-directive': 'error', 'svelte/html-quotes': 'warn', 'svelte/no-at-html-tags': 'warn' },
}];

const LS = ' ';
const cases = {
  'CONTROL html-quotes, no U+2028':
    '<i>x</i>\n<!-- eslint-disable-next-line svelte/html-quotes -->\n<div a=b></div>',
  'CONTROL no-at-html-tags, no U+2028':
    '<i>x</i>\n<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n<div>{@html x}</div>',
  'html-quotes, U+2028 before directive':
    `<i>${LS}</i>\n<!-- eslint-disable-next-line svelte/html-quotes -->\n<div a=b></div>`,
  'no-at-html-tags, U+2028 before directive':
    `<i>${LS}</i>\n<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n<div>{@html x}</div>`,
  'html-quotes, U+2028 AFTER directive (same parser line)':
    `<!-- eslint-disable-next-line svelte/html-quotes -->${LS}<div a=b></div>`,
  'no-at-html-tags, U+2028 AFTER directive (same parser line)':
    `<!-- eslint-disable-next-line svelte/no-at-html-tags -->${LS}<div>{@html x}</div>`,
};

for (const [name, code] of Object.entries(cases)) {
  const msgs = linter.verify(code, cfg, 'App.svelte');
  console.log(`--- ${name}`);
  if (!msgs.length) console.log('   SUPPRESSED (no findings)');
  for (const m of msgs) console.log(`   ${m.ruleId} @ ${m.line}:${m.column}`);
}
