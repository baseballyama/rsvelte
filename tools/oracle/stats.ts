import { allUnits, applies, includedSources } from './manifest.ts';
import { TASKS } from './tasks.ts';

/** `oracle stats` */
export async function main(): Promise<void> {
	const units = allUnits();
	const by = (f: (u: (typeof units)[number]) => string) =>
		units.reduce<Record<string, number>>((m, u) => ((m[f(u)] = (m[f(u)] ?? 0) + 1), m), {});
	console.log(`sources: ${includedSources().length}  units: ${units.length}`);
	console.log(
		'by family/lang:',
		by((u) => `${u.family}/${u.lang}`),
	);
	console.log(
		'by inferredMode (svelte):',
		by((u) => (u.lang === 'svelte' ? (u.inferredMode ?? '?') : '-')),
	);
	for (const t of TASKS)
		for (const v of t.variants)
			console.log(
				`task ${t.id}/${v.id}: ${units.filter((u) => applies(t, v.id, u)).length} units (${t.storage})`,
			);
}
