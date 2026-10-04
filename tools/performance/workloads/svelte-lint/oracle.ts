import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '../../../..');
const require = createRequire(path.join(root, 'tools/fixtures/package.json'));
const { Linter } = require('eslint');
const plugin = require('eslint-plugin-svelte').default;
const parser = require('@typescript-eslint/parser');
const [list, count] = process.argv.slice(2);
if (!list || !count) throw new Error('expected <inputs.txt> <rounds>');
const rounds = Number(count);
if (!Number.isSafeInteger(rounds) || rounds <= 0) throw new Error('invalid rounds');
const documents = fs.readFileSync(list, 'utf8').trimEnd().split('\n').map(filename => ({
  filename, source: fs.readFileSync(filename, 'utf8')
}));
const linter = new Linter({ configType: 'flat', cwd: root });
const rule = 'svelte/button-has-type';
const configuration = [
  ...plugin.configs.base,
  { files: ['**/*.svelte'], languageOptions: { parserOptions: { parser } }, rules: { [rule]: 'error' } }
];
function verify(source: string, filename: string) {
  const messages = linter.verify(source, configuration, { filename });
  if (messages.some((message: { fatal?: boolean; ruleId: string | null }) => message.fatal || message.ruleId !== rule)) {
    throw new Error(`oracle failed: ${JSON.stringify(messages)}`);
  }
  return messages;
}
if (verify('<button/>', path.join(root, 'control.svelte')).length !== 1) {
  throw new Error('the missing type positive control did not report');
}
let outputBytes = 0;
let findings = 0;
for (let round = 0; round < rounds; round++) {
  for (const document of documents) {
    const messages = verify(document.source, path.join(root, 'performance.svelte'));
    findings += messages.length;
    outputBytes += Buffer.byteLength(JSON.stringify({ rules: [rule], findings: messages }));
  }
}
process.stdout.write(JSON.stringify({ documents: documents.length, rounds, output_bytes: outputBytes, findings }) + '\n');
