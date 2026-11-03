import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { compare } from './compare.ts';
import { REGISTRY } from './paths.ts';
import { TASKS } from './tasks.ts';

/** `fixtures check [--update]` */
export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({
		args,
		options: { update: { type: 'boolean', default: false } },
	});
	// The parity ratchet, one verdict per task, variant and unit: `match`, or its worst artifact
	// verdict. A unit rsvelte refuses (it wrote only diagnostics where the oracle has output) is not
	// listed, so a unit becoming refused shows as an entry that went and a newly supported one as
	// an entry that came. Two-sided: every difference from _registry/parity.json fails, a fix
	// included, so the change that makes it records it. Nothing is capped: CI's log is the list
	// a re-baseline is read from.
	const file = path.join(REGISTRY, 'parity.json');
	const rank = ['match', 'unexpected', 'missing', 'mismatch', 'unparseable'] as const;
	const now: Record<string, string> = {};
	for (const t of TASKS) {
		for (const v of t.variants) {
			// oxlint-disable-next-line no-await-in-loop -- behaviour traces share the one DOM in behaviour/client.ts
			const r = await compare({ taskId: t.id, variantId: v.id });
			const units = new Map<string, typeof r.rows>();
			for (const x of r.rows) units.set(x.key, [...(units.get(x.key) ?? []), x]);
			let refused = 0;
			const counts: Record<string, number> = {};
			for (const [key, rows] of units) {
				const onlyDiagnostics = rows.every(
					(x) =>
						(x.verdict === 'unexpected' && x.ext === 'diagnostics.json') || x.verdict === 'missing',
				);
				if (onlyDiagnostics && rows.some((x) => x.ext === 'diagnostics.json')) {
					refused++;
					continue;
				}
				const verdict = rows.reduce<string>(
					(w, x) =>
						rank.indexOf(x.verdict) > rank.indexOf(w as (typeof rank)[number]) ? x.verdict : w,
					'match',
				);
				counts[verdict] = (counts[verdict] ?? 0) + 1;
				now[`${t.id}/${v.id} ${key}`] = verdict;
			}
			console.log(
				`${`${t.id}/${v.id}`.padEnd(28)} units ${String(r.units).padStart(6)}  refused ${String(refused).padStart(6)}  ${JSON.stringify(counts)}`,
			);
		}
	}
	const sorted = Object.fromEntries(
		Object.entries(now).toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
	);
	if (values.update) {
		fs.writeFileSync(file, JSON.stringify(sorted, null, '\t') + '\n');
		console.log(
			`wrote ${Object.keys(sorted).length} units to ${path.relative(process.cwd(), file)}`,
		);
		return;
	}
	const known: Record<string, string> = fs.existsSync(file)
		? JSON.parse(fs.readFileSync(file, 'utf8'))
		: {};
	const moved = [...new Set([...Object.keys(known), ...Object.keys(now)])]
		.filter((k) => known[k] !== now[k])
		.toSorted();
	for (const k of moved)
		console.log(
			`MOVED  ${(known[k] ?? 'refused').padEnd(11)} -> ${(now[k] ?? 'refused').padEnd(11)} ${k}`,
		);
	console.log(
		`${Object.keys(now).length} units compared (refused ones not listed), ${moved.length} moved from ${path.relative(process.cwd(), file)}`,
	);
	if (moved.length) console.log('record an intended change with `fixtures check --update`');
	if (moved.length) process.exitCode = 1;
}
