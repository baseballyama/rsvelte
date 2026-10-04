import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '../../..');
const require = createRequire(path.join(root, 'tools/fixtures/package.json'));
const { Linter } = require('eslint');
const plugin = require('eslint-plugin-svelte').default;
const parser = require('@typescript-eslint/parser');
const upstream = fs.realpathSync(process.argv[2]);
const manifest = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'svelte-upstream-hashes.json'), 'utf8'));
const revision: string = manifest.commit;
for (const [relative, expected] of Object.entries(manifest.files)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(upstream, relative))).digest('hex');
  if (actual !== expected) throw new Error(`upstream file differs from ${revision}: ${relative}`);
}
const suites = ['lint', 'lint_typed'].map(name => {
  const directory = path.join(root, 'crates/languages/svelte', name, 'tests/rules');
  return { directory, sourceRoot: path.join(directory, 'eslint-plugin-svelte'), cases: [] as string[], imported: {} as Record<string, string> };
});
const suiteFor = (rule: string) => suites[rule === 'svelte/@typescript-eslint/no-unnecessary-condition' ? 1 : 0];
const project = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-lint-oracle-'));
fs.symlinkSync(path.join(root, 'tools/fixtures/node_modules'), path.join(project, 'node_modules'), 'dir');
fs.writeFileSync(path.join(project, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true, types: [] }, include: ['*.svelte'] }));
const filename = path.join(project, 'input.svelte');
const linter = new Linter({ configType: 'flat', cwd: project });
const packageVersion = (name: string) => require(`${name}/package.json`).version;
for (const suite of suites) {
  fs.mkdirSync(path.join(suite.sourceRoot, 'licenses'), { recursive: true });
  fs.copyFileSync(path.join(upstream, 'LICENSE'), path.join(suite.sourceRoot, 'licenses/LICENSE'));
  fs.writeFileSync(path.join(suite.sourceRoot, 'source.json'), JSON.stringify({ repository: 'https://github.com/sveltejs/eslint-plugin-svelte', commit: revision, license: 'MIT', oracles: Object.fromEntries(['eslint', 'eslint-plugin-svelte', 'svelte-eslint-parser', '@typescript-eslint/parser', 'typescript', 'svelte'].map(name => [name, packageVersion(name)])) }, null, 2) + '\n');
}

function rustRule(rule: string, options: Record<string, boolean>) {
  if (rule === 'svelte/button-has-type') return `RuleConfiguration::ButtonHasType { severity: Severity::Error, allowed: Allowed { button: ${options.button ?? true}, submit: ${options.submit ?? true}, reset: ${options.reset ?? true} } }`;
  if (rule === 'svelte/valid-each-key') return 'RuleConfiguration::ValidEachKey(Severity::Error)';
  throw new Error(`unsupported rule: ${rule}`);
}

function rustString(value: string) {
  if (value.length < 65) return JSON.stringify(value);
  const parts = value.match(/.{1,60}/g)!;
  return `concat!(${parts.map(part => JSON.stringify(part)).join(', ')})`;
}

function add(name: string, document: string, code: string, rule: string, options: Record<string, boolean>, strict: boolean) {
  const suite = suiteFor(rule);
  suite.imported[name] = crypto.createHash('sha256').update(code).digest('hex');
  const directory = path.join(suite.directory, name);
  fs.mkdirSync(path.join(directory, 'expected'), { recursive: true });
  fs.writeFileSync(path.join(directory, 'input.svelte'), code);
  fs.writeFileSync(path.join(directory, 'configuration.json'), JSON.stringify({ rule, options }, null, 2) + '\n');
  fs.writeFileSync(filename, code);
  const config = [
    ...plugin.configs.base,
    { files: ['**/*.svelte'], languageOptions: { parserOptions: { parser, extraFileExtensions: ['.svelte'], project: path.join(project, 'tsconfig.json'), tsconfigRootDir: project, svelteFeatures: { runes: true } } }, rules: { [rule]: ['error', ...(Object.keys(options).length ? [options] : [])] } }
  ];
  const messages = linter.verify(code, config, { filename });
  if (messages.some((m: { fatal?: boolean; ruleId: string | null }) => m.fatal || !m.ruleId || m.ruleId !== rule)) throw new Error(`${name}: oracle failed: ${JSON.stringify(messages)}`);
  if (['rsvelte/typed-true', 'rsvelte/typed-false', 'rsvelte/typed-number', 'rsvelte/const-alias'].includes(name) && !messages.length) throw new Error(`${name}: the positive control did not report`);
  const findings = messages.map((m: { ruleId: string; message: string; line: number; column: number; endLine?: number; endColumn?: number }) => ({ rule: m.ruleId, message: m.message, start: { line: m.line, column: m.column }, end: m.endLine === undefined ? null : { line: m.endLine, column: m.endColumn } }));
  fs.writeFileSync(path.join(directory, 'expected/findings.lint.json'), JSON.stringify({ rules: [rule], findings }, null, '\t') + '\n');
  const configuration = rule === 'svelte/@typescript-eslint/no-unnecessary-condition'
    ? 'severity: Severity::Error'
    : `rules: &[${rustRule(rule, options)}]`;
  suite.cases.push(`    CaseConfiguration { name: ${rustString(name)}, document: ${rustString(document)}, ${configuration}, strict: ${strict} },`);
}

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]).sort();
}

const fixtures = path.join(upstream, 'packages/eslint-plugin-svelte/tests/fixtures/rules');
for (const name of ['button-has-type', 'valid-each-key', '@typescript-eslint/no-unnecessary-condition']) {
  const base = path.join(fixtures, name);
  for (const input of walk(base).filter(file => file.endsWith('-input.svelte'))) {
    const relative = path.relative(base, input).replace('-input.svelte', '.svelte');
    const document = `${name}/${relative}`;
    let options = {};
    let current = path.dirname(input);
    const configs: string[] = [];
    while (current.startsWith(base)) {
      const config = path.join(current, '_config.json');
      if (fs.existsSync(config)) configs.unshift(config);
      if (current === base) break;
      current = path.dirname(current);
    }
    for (const config of configs) options = { ...options, ...JSON.parse(fs.readFileSync(config, 'utf8')).options?.[0] };
    add(`eslint-plugin-svelte/${document}`, document, fs.readFileSync(input, 'utf8'), `svelte/${name}`, options, name !== '@typescript-eslint/no-unnecessary-condition');
    for (const config of configs) fs.copyFileSync(config, path.join(suiteFor(`svelte/${name}`).sourceRoot, document, '_config.json'));
    const errors = input.replace('-input.svelte', '-errors.yaml');
    if (fs.existsSync(errors)) fs.copyFileSync(errors, path.join(suiteFor(`svelte/${name}`).sourceRoot, document, 'upstream-errors.yaml'));
  }
}

const buttonInput = fs.readFileSync(path.join(fixtures, 'button-has-type/valid/test01-input.svelte'), 'utf8');
for (let mask = 0; mask < 8; mask++) {
  const document = `button-has-type/matrix/${mask}.svelte`;
  add(`eslint-plugin-svelte/${document}`, document, buttonInput, 'svelte/button-has-type', { button: Boolean(mask & 1), submit: Boolean(mask & 2), reset: Boolean(mask & 4) }, true);
}
for (const [name, body] of [
  ['typed-true', 'function f(value: true) { if (value) console.log(value); }'],
  ['typed-false', 'function f(value: false) { if (value) console.log(value); }'],
  ['typed-number', 'function f(value: number) { const result = value ?? 0; console.log(result); }'],
  ['typed-unknown', 'function f(value: unknown) { if (value) console.log(value); }'],
  ['const-alias', 'const a = true; const b = a; if (b) console.log(b);'],
  ['mutable', 'let a = false; a = Math.random() > 0.5; if (a) console.log(a);'],
  ['cyclic-alias', 'const a = b; const b = a; if (a) console.log(a);'],
  ['asserted-literal', 'const a = true as boolean; if (a) console.log(a);'],
  ['asserted-reference', 'const a = true; if (a as boolean) console.log(a);'],
  ['asserted-alias', 'const a = true; const b = a as boolean; if (b) console.log(b);'],
  ['union', 'function f(value: true | false) { if (value) console.log(value); }'],
  ['forward-alias', 'const a = b; const b = true; if (a) console.log(a);'],
  ['shadowed-alias', 'const a = true; function f(a: unknown) { if (a) console.log(a); }'],
  ['typed-template', 'let a: true = true;'],
  ['negation', 'if (!true) console.log(1); if (!!true) console.log(2); if (!(Math.random() && true)) console.log(3);'],
  ['asserted-condition', 'if (!true as boolean) console.log(1); if ((Math.random() && true) as boolean) console.log(2); if (true as true) console.log(3); if (false as false) console.log(4);'],
  ['optional-parameter', 'function f(value?: true) { if (value) console.log(value); } function g(value?: number) { console.log(value ?? 0); }']
]) {
  add(`rsvelte/${name}`, `rsvelte/${name}.svelte`, `<script lang="ts">${body}</script>${name === "typed-template" ? "{a ? 1 : 0}" : ""}`, 'svelte/@typescript-eslint/no-unnecessary-condition', {}, true);
}
for (const [index, suite] of suites.entries()) {
  const imports = 'use super::CaseConfiguration;\nuse rsvelte_kernel::diagnostics::diagnostic::Severity;\n'
    + (index === 0 ? 'use rsvelte_markup::button_type::Allowed;\nuse rsvelte_svelte_lint::RuleConfiguration;\n' : '');
  fs.writeFileSync(path.join(suite.directory, 'cases.rs'), imports + '\npub(crate) const CASES: &[CaseConfiguration] = &[\n' + suite.cases.join('\n') + '\n];\n');
  fs.writeFileSync(path.join(suite.sourceRoot, 'input-hashes.json'), JSON.stringify(suite.imported, null, 2) + '\n');
}
process.stdout.write(JSON.stringify({ revision, cases: suites.map(suite => ({ directory: suite.directory, count: suite.cases.length })), project }) + '\n');
