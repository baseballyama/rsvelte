// `oracle lint-cases [--update]`: write ESLint's verdict for the lint crate's own rule cases
// (crates/languages/svelte/lint/tests/cases), which follow eslint-plugin-svelte's fixture layout:
// `<rule>/{valid,invalid}/…/<name>-input.svelte`, options in `<name>-config.json` or
// `_config.json`, the reports in `<name>-errors.yaml`. As upstream's runner does, a missing
// errors.yaml is written and an existing one is kept unless --update; a valid case must report
// nothing and an invalid one something.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import type { Linter as LinterType } from 'eslint';

const ROOT = path.resolve(import.meta.dirname, '../../crates/languages/svelte/lint/tests/cases');

const sibling = (input: string, name: string) => input.replace(/(input|\+.+)(?:\.[a-z]+)+$/u, name);

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

// A rule is a directory with `valid/` or `invalid/`, possibly under a prefix (`@typescript-eslint/`).
function rules(directory: string): string[] {
	if (['valid', 'invalid'].some((kind) => fs.existsSync(path.join(directory, kind))))
		return [path.relative(ROOT, directory)];
	return fs
		.readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.flatMap((entry) => rules(path.join(directory, entry.name)));
}

// A type-aware rule reads a TypeScript project.
const typedRule = (rule: string) => rule.startsWith('@typescript-eslint/');

export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({ args, options: { update: { type: 'boolean', default: false } } });
	const require = createRequire(path.join(import.meta.dirname, 'package.json'));
	const { Linter } = require('eslint') as typeof import('eslint');
	const plugin = require('eslint-plugin-svelte').default;
	const svelteParser = require('svelte-eslint-parser');
	const typescriptParser = require('@typescript-eslint/parser');
	const globals = require('globals');
	const yaml = require('yaml');
	const linter = new Linter();
	// Type-aware rules read a strict TypeScript project that holds the input as its only file.
	const project = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-lint-cases-'));
	fs.symlinkSync(
		path.join(import.meta.dirname, 'node_modules'),
		path.join(project, 'node_modules'),
	);
	fs.writeFileSync(
		path.join(project, 'tsconfig.json'),
		JSON.stringify({ compilerOptions: { strict: true, types: [] }, include: ['*.svelte'] }),
	);
	const projectInput = path.join(project, 'input.svelte');
	const projectLinter = new Linter({ cwd: project });
	let written = 0;
	let cases = 0;
	// After a run with a TypeScript project, one without it fails in ESLint (`addGlobals`).
	const ordered = rules(ROOT).toSorted((a, b) => Number(typedRule(a)) - Number(typedRule(b)));
	for (const rule of ordered) {
		const typed = typedRule(rule);
		for (const kind of ['valid', 'invalid'] as const) {
			const directory = path.join(ROOT, rule, kind);
			if (!fs.existsSync(directory)) continue;
			for (const input of inputs(directory)) {
				cases++;
				const code = fs.readFileSync(input, 'utf8');
				const ruleConfig: LinterType.RulesRecord = {
					[`svelte/${rule}`]: ['error', ...options(input)],
				};
				let messages: LinterType.LintMessage[];
				if (typed) {
					fs.writeFileSync(projectInput, code);
					messages = projectLinter.verify(
						code,
						[
							...plugin.configs.base,
							{
								files: ['**/*.svelte'],
								languageOptions: {
									parserOptions: {
										parser: typescriptParser,
										extraFileExtensions: ['.svelte'],
										project: path.join(project, 'tsconfig.json'),
										tsconfigRootDir: project,
										svelteFeatures: { runes: true },
									},
								},
								rules: ruleConfig,
							},
						],
						{ filename: projectInput },
					);
				} else {
					// upstream's writeFixtures, without a TypeScript project.
					messages = linter.verify(
						code,
						{
							files: ['**'],
							plugins: { svelte: plugin },
							rules: ruleConfig,
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
				}
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
				if (fs.existsSync(errors) && !values.update) continue;
				const report = messages.map((m) => ({
					message: m.message,
					line: m.line,
					column: m.column,
					suggestions: m.suggestions?.length ? m.suggestions : null,
				}));
				if (report.some((r) => r.suggestions))
					throw new Error(`${relative}: suggestions are not written yet`);
				fs.writeFileSync(errors, yaml.stringify(report));
				written++;
			}
		}
	}
	if (!cases) throw new Error(`no cases under ${ROOT}`);
	console.log(`${cases} cases, ${written} errors.yaml written`);
}
