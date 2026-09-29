import { Linter } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import sveltePlugin from 'eslint-plugin-svelte';
import * as tsParser from '@typescript-eslint/parser';
import type { Task } from '../types.ts';

type RuleEntry = Linter.RuleEntry;

// Every rule the oracle can run, so expected output does not depend on which rules rsvelte has
// ported: every non-deprecated core rule (what `@eslint/js`'s `configs.all` lists), then
// eslint-plugin-svelte's `all` (its `base` — parser, processor, the core rules it turns off — and
// every plugin rule). Core first, as a user config lists them, so `base` can turn core rules off.
const CORE_ALL: Record<string, RuleEntry> = Object.fromEntries(
	[...builtinRules]
		.filter(([, rule]) => !rule.meta?.deprecated)
		.map(([id]) => [id, 'error'] as const)
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
);

const CONFIG: Linter.Config[] = [
	{ files: ['**/*.svelte'], rules: CORE_ALL },
	...sveltePlugin.configs.all,
	{ files: ['**/*.svelte'], languageOptions: { parserOptions: { parser: tsParser, svelteFeatures: { runes: true } } } }
];

const severity = (e: RuleEntry): unknown => (Array.isArray(e) ? e[0] : e);

/** The rules on for a `.svelte` file, in the order ESLint runs them (first mention wins). */
const ENABLED: string[] = (() => {
	const rules = new Map<string, RuleEntry>();
	for (const c of CONFIG) for (const [id, e] of Object.entries(c.rules ?? {})) rules.set(id, e as RuleEntry);
	return [...rules].filter(([, e]) => !['off', 0].includes(severity(e) as string | number)).map(([id]) => id);
})();

const linter = new Linter({ configType: 'flat' });

// Hand-written units only, like svelte.format.
const task: Task = {
	id: 'svelte.lint',
	storage: 'committed',
	oracles: ['eslint', 'eslint-plugin-svelte', 'svelte-eslint-parser', '@typescript-eslint/parser'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'svelte' && unit.source === 'rsvelte',
	run(unit, src) {
		const messages = linter.verify(src, CONFIG, { filename: unit.path });
		const findings = messages.map((m) => ({
			rule: m.ruleId,
			message: m.message,
			// ESLint positions: 1-based line, 1-based column (UTF-16).
			start: { line: m.line, column: m.column },
			end: m.endLine === undefined ? null : { line: m.endLine, column: m.endColumn }
		}));
		const text = JSON.stringify({ rules: ENABLED, findings }, null, '\t') + '\n';
		return { findings: { text, ext: 'lint.json', compare: 'lint' } };
	}
};
export default task;
