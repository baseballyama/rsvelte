import { Linter } from 'eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import * as svelteParser from 'svelte-eslint-parser';
import * as tsParser from '@typescript-eslint/parser';
import type { Task } from '../types.ts';

// The rules rsvelte implements; each needs both script and template facts, which is the point.
export const LINT_RULES = {
	'no-unused-vars': 'error',
	'svelte/button-has-type': 'error'
} as const;

const linter = new Linter({ configType: 'flat' });

// Hand-written units only, like svelte.format.
const task: Task = {
	id: 'svelte.lint',
	storage: 'committed',
	oracles: ['eslint', 'eslint-plugin-svelte', 'svelte-eslint-parser', '@typescript-eslint/parser'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'svelte' && unit.source === 'rsvelte',
	run(unit, src) {
		const messages = linter.verify(
			src,
			[
				{
					files: ['**/*.svelte'],
					plugins: { svelte: sveltePlugin },
					languageOptions: { parser: svelteParser, parserOptions: { parser: tsParser, svelteFeatures: { runes: true } } },
					rules: LINT_RULES
				}
			],
			{ filename: unit.path }
		);
		const findings = messages.map((m) => ({
			rule: m.ruleId,
			message: m.message,
			// ESLint positions: 1-based line, 1-based column (UTF-16).
			start: { line: m.line, column: m.column },
			end: m.endLine === undefined ? null : { line: m.endLine, column: m.endColumn }
		}));
		return { findings: { text: JSON.stringify(findings, null, '\t') + '\n', ext: 'json', compare: 'json' } };
	}
};
export default task;
