import { createHash } from 'node:crypto';
import { parse } from 'svelte/compiler';
import { diagnostic } from './compile-artifacts.ts';
import type { Artifact, Task } from '../types.ts';

/**
 * The AST as one text that does not depend on the order of its keys: JSON with every object's keys
 * sorted. A literal's value that JSON cannot hold, a bigint or a regular expression, is `null`, as
 * in ESTree's JSON; its `bigint` or `regex` field still holds it.
 */
export function canonical(ast: unknown): string {
	return JSON.stringify(ast, (_, value: unknown) => {
		if (typeof value === 'bigint' || value instanceof RegExp) return null;
		if (value === null || typeof value !== 'object' || Array.isArray(value)) return value;
		const sorted: Record<string, unknown> = {};
		for (const key of Object.keys(value).toSorted()) sorted[key] = (value as any)[key];
		return sorted;
	});
}

/**
 * The modern AST, kept as the sha256 of its canonical JSON: the AST is many times the size of the
 * component, so the corpus records whether it matches, not the AST. A parse error is itself the
 * expected result.
 */
const task: Task = {
	id: 'svelte.parse',
	oracles: ['svelte'],
	variants: [{ id: 'modern', options: { modern: true } }],
	appliesTo: (unit) => unit.lang === 'svelte',
	run: (_unit, src): Record<string, Artifact> => {
		let ast: unknown;
		try {
			ast = parse(src, { modern: true });
		} catch (e) {
			if (!(e as { code?: string }).code) throw e;
			return {
				error: {
					text: JSON.stringify(diagnostic(e as any), null, '\t') + '\n',
					ext: 'error.json',
					compare: 'json',
				},
			};
		}
		const hash = createHash('sha256').update(canonical(ast)).digest('hex');
		return { ast: { text: `${hash}\n`, ext: 'ast.sha256', compare: 'text' } };
	},
};
export default task;
