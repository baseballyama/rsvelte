// `oracle lint-cases [--update]`: write ESLint's verdict for the lint crate's own rule cases
// (crates/languages/svelte/lint/tests/cases), which follow eslint-plugin-svelte's fixture layout:
// `<rule>/{valid,invalid}/…/<name>-input.svelte`, options in `<name>-config.json` or
// `_config.json`, the reports in `<name>-errors.yaml` and a fixable rule's fixed code in
// `<name>-output.svelte`. As upstream's runner does, a missing file is written and an existing one
// is kept unless --update; a valid case must report nothing and an invalid one something.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parseArgs } from 'node:util';
import type { Linter as LinterType } from 'eslint';

const ROOT = path.resolve(import.meta.dirname, '../../crates/languages/svelte/lint/tests/cases');

const sibling = (input: string, name: string) => input.replace(/(input|\+.+)(?:\.[a-z]+)+$/u, name);

type Fix = { range: [number, number]; text: string };

// upstream's applySuggestion: the code with one suggestion applied.
const applySuggestion = (code: string, { range, text }: Fix) =>
	`${code.slice(0, range[0])}${text}${code.slice(range[1])}`;

// upstream's applyFixes (tests/utils/source-code-fixer.ts): one pass in range order that skips a
// fix overlapping the one before it.
function applyFixes(code: string, fixes: Fix[]): string {
	let output = '';
	let last = Number.NEGATIVE_INFINITY;
	const sorted = fixes.toSorted((a, b) => a.range[0] - b.range[0] || a.range[1] - b.range[1]);
	for (const { range, text } of sorted) {
		if (last >= range[0] || range[0] > range[1]) continue;
		output += code.slice(Math.max(0, last), Math.max(0, range[0])) + text;
		last = range[1];
	}
	return output + code.slice(Math.max(0, last));
}

function inputs(directory: string): string[] {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name.startsWith('_')) return [];
		const file = path.join(directory, entry.name);
		if (/(?:input|^\+.*)\.svelte$/u.test(entry.name)) return [file];
		return entry.isDirectory() ? inputs(file) : [];
	});
}

function options(input: string): unknown[] {
	const file = [sibling(input, 'config.json'), path.join(path.dirname(input), '_config.json')].find(
		(f) => fs.existsSync(f),
	);
	if (!file) return [];
	const config = JSON.parse(fs.readFileSync(file, 'utf8'));
	const keys = Object.keys(config).filter((k) => k !== 'options');
	if (keys.length) throw new Error(`${file}: only options are supported, not ${keys.join(', ')}`);
	return config.options ?? [];
}

export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({ args, options: { update: { type: 'boolean', default: false } } });
	const require = createRequire(path.join(import.meta.dirname, 'package.json'));
	const { Linter } = require('eslint') as typeof import('eslint');
	const plugin = require('eslint-plugin-svelte').default;
	const svelteParser = require('svelte-eslint-parser');
	const globals = require('globals');
	const yaml = require('yaml');
	const linter = new Linter();
	let written = 0;
	let cases = 0;
	for (const rule of fs.readdirSync(ROOT)) {
		for (const kind of ['valid', 'invalid'] as const) {
			const directory = path.join(ROOT, rule, kind);
			if (!fs.existsSync(directory)) continue;
			for (const input of inputs(directory)) {
				cases++;
				// upstream's writeFixtures, without a TypeScript project: no case here uses type information.
				const code = fs.readFileSync(input, 'utf8');
				const messages: LinterType.LintMessage[] = linter.verify(
					code,
					{
						files: ['**'],
						plugins: { svelte: plugin },
						rules: { [`svelte/${rule}`]: ['error', ...options(input)] },
						languageOptions: {
							globals: globals.browser,
							ecmaVersion: 'latest',
							sourceType: 'module',
							parser: svelteParser,
							parserOptions: { parser: { ts: '@typescript-eslint/parser', js: 'espree' } },
						},
					},
					input,
				);
				const fatal = messages.find((m) => m.fatal);
				if (fatal) throw new Error(`${input}: ${fatal.message}`);
				const relative = path.relative(ROOT, input);
				if (kind === 'valid') {
					if (messages.length)
						throw new Error(`${relative} is valid but reports ${messages.length}`);
					continue;
				}
				if (!messages.length) throw new Error(`${relative} is invalid but reports nothing`);
				const errors = sibling(input, 'errors.yaml');
				if (!fs.existsSync(errors) || values.update) {
					const report = messages.map((m) => ({
						message: m.message,
						line: m.line,
						column: m.column,
						suggestions: m.suggestions
							? m.suggestions.map((s) => ({
									desc: s.desc,
									messageId: s.messageId,
									output: applySuggestion(code, s.fix),
								}))
							: null,
					}));
					fs.writeFileSync(errors, yaml.stringify(report));
					written++;
				}
				const output = sibling(input, `output${path.extname(input)}`);
				const fixable = plugin.rules[rule].meta?.fixable != null;
				if (fixable && (!fs.existsSync(output) || values.update)) {
					fs.writeFileSync(
						output,
						applyFixes(
							code,
							messages.flatMap((m) => (m.fix ? [m.fix] : [])),
						),
					);
					written++;
				}
			}
		}
	}
	if (!cases) throw new Error(`no cases under ${ROOT}`);
	console.log(`${cases} cases, ${written} files written`);
}
