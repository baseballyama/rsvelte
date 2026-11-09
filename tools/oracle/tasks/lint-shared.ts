import type { Linter } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import type { Artifact } from '../types.ts';

/** The core rules `@eslint/js`'s `configs.recommended` lists, sorted: what a project starts from.
 * Every core rule would make the expected output mostly rules rsvelte will never have. */
export const CORE_RECOMMENDED: Record<string, Linter.RuleEntry> = Object.fromEntries(
	[...builtinRules]
		.filter(([, rule]) => !rule.meta?.deprecated && rule.meta?.docs?.recommended)
		.map(([id]) => [id, 'error'] as const)
		.toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
);

const severity = (e: Linter.RuleEntry): unknown => (Array.isArray(e) ? e[0] : e);

/** The rules a configuration turns on, in the order ESLint runs them (first mention wins). */
export function enabledRules(config: Linter.Config[]): string[] {
	const rules = new Map<string, Linter.RuleEntry>();
	for (const c of config)
		for (const [id, e] of Object.entries(c.rules ?? {})) rules.set(id, e as Linter.RuleEntry);
	return [...rules]
		.filter(([, e]) => !['off', 0].includes(severity(e) as string | number))
		.map(([id]) => id);
}

/**
 * `lint.txt`, one finding per line in ESLint's order, with ESLint's positions (1-based line and
 * UTF-16 column): `<line>:<column> <end line>:<end column> <rule> <message as a JSON string>`, with
 * `-` for no end and for no rule (a fatal parse error). The rules that ran go to oracles.json.
 */
export function lintArtifacts(messages: Linter.LintMessage[]): Record<string, Artifact> {
	const text = messages
		.map((m) => {
			const end = m.endLine === undefined ? '-' : `${m.endLine}:${m.endColumn}`;
			return `${m.line}:${m.column} ${end} ${m.ruleId ?? '-'} ${JSON.stringify(m.message)}\n`;
		})
		.join('');
	return { findings: { text, ext: 'lint.txt', compare: 'lint' } };
}
