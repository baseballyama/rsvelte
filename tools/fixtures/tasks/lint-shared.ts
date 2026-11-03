import type { Linter } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import type { Artifact } from '../types.ts';

/** Every non-deprecated core rule (what `@eslint/js`'s `configs.all` lists), sorted. */
export const CORE_ALL: Record<string, Linter.RuleEntry> = Object.fromEntries(
	[...builtinRules]
		.filter(([, rule]) => !rule.meta?.deprecated)
		.map(([id]) => [id, 'error'] as const)
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
);

const severity = (e: Linter.RuleEntry): unknown => (Array.isArray(e) ? e[0] : e);

/** The rules a configuration turns on, in the order ESLint runs them (first mention wins). */
export function enabledRules(config: Linter.Config[]): string[] {
	const rules = new Map<string, Linter.RuleEntry>();
	for (const c of config) for (const [id, e] of Object.entries(c.rules ?? {})) rules.set(id, e as Linter.RuleEntry);
	return [...rules].filter(([, e]) => !['off', 0].includes(severity(e) as string | number)).map(([id]) => id);
}

/** `{rules, findings}` as `lint.json`: the rules that ran, and ESLint's positions (1-based line and UTF-16 column). */
export function lintArtifacts(messages: Linter.LintMessage[], rules: string[]): Record<string, Artifact> {
	const findings = messages.map((m) => ({
		rule: m.ruleId,
		message: m.message,
		start: { line: m.line, column: m.column },
		end: m.endLine === undefined ? null : { line: m.endLine, column: m.endColumn }
	}));
	const text = JSON.stringify({ rules, findings }, null, '\t') + '\n';
	return { findings: { text, ext: 'lint.json', compare: 'lint' } };
}
