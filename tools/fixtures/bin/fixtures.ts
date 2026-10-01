#!/usr/bin/env node
// fixtures import  --from <dir> [--source id,...] [--accept-commit]
// fixtures regen   [--task id,...] [--source id,...]
// fixtures adjust  [--write]
// fixtures compare --task id --variant id [--source id,...] [--family name,...] [--report <file>]   reads each unit's actual/
// fixtures check [--update]   every task and variant over every unit, against _registry/parity.json
// fixtures upgrade    regen every task, then re-validate adjustments (after bumping an oracle in package.json)
// fixtures stats
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { runImport } from '../src/import.ts';
import { regen } from '../src/regen.ts';
import { verifyAdjustments } from '../src/adjust.ts';
import { compare } from '../src/compare.ts';
import { allUnits, applies, includedSources } from '../src/manifest.ts';
import { TASKS } from '../src/tasks/index.ts';
import { REGISTRY } from '../src/paths.ts';

const { positionals, values } = parseArgs({
	allowPositionals: true,
	options: {
		from: { type: 'string' },
		source: { type: 'string' },
		family: { type: 'string' },
		task: { type: 'string' },
		variant: { type: 'string' },
		report: { type: 'string' },
		write: { type: 'boolean', default: false },
		update: { type: 'boolean', default: false },
		'accept-commit': { type: 'boolean', default: false }
	}
});
const list = (v: string | undefined) => v?.split(',');

function reportAdjustments(write: boolean): number {
	const r = verifyAdjustments({ write });
	console.log(`adjustments: ${r.units} unit(s) ${JSON.stringify(r.counts)}`);
	for (const p of r.problems) console.log(`  ${p}`);
	return r.counts.stale + r.counts.redundant + (write ? 0 : r.counts.rebased);
}

let failures = 0;
switch (positionals[0]) {
	case 'import': {
		if (!values.from) throw new Error('--from <dir holding the source checkouts> is required');
		failures += runImport({ from: path.resolve(values.from), only: list(values.source), acceptCommit: values['accept-commit'] }).orphans.length;
		break;
	}
	case 'regen':
		failures += (await regen({ taskIds: list(values.task), sourceIds: list(values.source) })).unparseable.length;
		break;
	case 'upgrade':
		failures += (await regen({})).unparseable.length;
		failures += reportAdjustments(false);
		console.log("review `git diff --stat -- ':(glob)fixtures/**/expected/**'`: every changed snapshot is an upstream behaviour change");
		break;
	case 'adjust':
		failures += reportAdjustments(values.write);
		break;
	case 'compare': {
		if (!values.task || !values.variant) throw new Error('--task and --variant are required');
		const r = await compare({ taskId: values.task, variantId: values.variant, sourceIds: list(values.source), families: list(values.family) });
		console.log(`units: ${r.units}  ${JSON.stringify(r.counts)}`);
		const lines = r.rows
			.filter((x) => x.verdict !== 'match')
			.map((x) => `${x.verdict.padEnd(11)} ${x.key} [${x.ext}]${x.detail ? ` ${x.detail}` : ''}`);
		if (values.report) fs.writeFileSync(values.report, lines.join('\n') + '\n');
		const SHOW = 20;
		for (const l of lines.slice(0, SHOW)) console.log(`  ${l}`);
		if (lines.length > SHOW) console.log(`  … and ${lines.length - SHOW} more${values.report ? ` (all in ${values.report})` : ' (pass --report <file> for all)'}`);
		failures += lines.length;
		break;
	}
	case 'check': {
		// The parity ratchet, one verdict per task, variant and unit: `match`, or its worst artifact
		// verdict. A unit rsv refuses (it wrote only diagnostics where the oracle has output) is not
		// listed, so a unit becoming refused shows as an entry that went and a newly supported one as
		// an entry that came. Two-sided: every difference from _registry/parity.json fails, a fix
		// included, so the change that makes it records it. Nothing is capped: CI's log is the list
		// a re-baseline is read from.
		const file = path.join(REGISTRY, 'parity.json');
		const rank = ['match', 'unexpected', 'missing', 'mismatch', 'unparseable'] as const;
		const now: Record<string, string> = {};
		for (const t of TASKS) {
			for (const v of t.variants) {
				const r = await compare({ taskId: t.id, variantId: v.id });
				const units = new Map<string, typeof r.rows>();
				for (const x of r.rows) units.set(x.key, [...(units.get(x.key) ?? []), x]);
				let refused = 0;
				const counts: Record<string, number> = {};
				for (const [key, rows] of units) {
					const onlyDiagnostics = rows.every((x) => (x.verdict === 'unexpected' && x.ext === 'diagnostics.json') || x.verdict === 'missing');
					if (onlyDiagnostics && rows.some((x) => x.ext === 'diagnostics.json')) {
						refused++;
						continue;
					}
					const verdict = rows.reduce<string>((w, x) => (rank.indexOf(x.verdict) > rank.indexOf(w as (typeof rank)[number]) ? x.verdict : w), 'match');
					counts[verdict] = (counts[verdict] ?? 0) + 1;
					now[`${t.id}/${v.id} ${key}`] = verdict;
				}
				console.log(`${`${t.id}/${v.id}`.padEnd(28)} units ${String(r.units).padStart(6)}  refused ${String(refused).padStart(6)}  ${JSON.stringify(counts)}`);
			}
		}
		const sorted = Object.fromEntries(Object.entries(now).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
		if (values.update) {
			fs.writeFileSync(file, JSON.stringify(sorted, null, '\t') + '\n');
			console.log(`wrote ${Object.keys(sorted).length} units to ${path.relative(process.cwd(), file)}`);
			break;
		}
		const known: Record<string, string> = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
		const moved = [...new Set([...Object.keys(known), ...Object.keys(now)])].filter((k) => known[k] !== now[k]).sort();
		for (const k of moved) console.log(`MOVED  ${(known[k] ?? 'refused').padEnd(11)} -> ${(now[k] ?? 'refused').padEnd(11)} ${k}`);
		console.log(`${Object.keys(now).length} units compared (refused ones not listed), ${moved.length} moved from ${path.relative(process.cwd(), file)}`);
		if (moved.length) console.log('record an intended change with `fixtures check --update`');
		failures += moved.length;
		break;
	}
	case 'stats': {
		const units = allUnits();
		const by = (f: (u: (typeof units)[number]) => string) =>
			units.reduce<Record<string, number>>((m, u) => ((m[f(u)] = (m[f(u)] ?? 0) + 1), m), {});
		console.log(`sources: ${includedSources().length}  units: ${units.length}`);
		console.log('by family/lang:', by((u) => `${u.family}/${u.lang}`));
		console.log('by inferredMode (svelte):', by((u) => (u.lang === 'svelte' ? (u.inferredMode ?? '?') : '-')));
		for (const t of TASKS) for (const v of t.variants) console.log(`task ${t.id}/${v.id}: ${units.filter((u) => applies(t, v.id, u)).length} units (${t.storage})`);
		break;
	}
	default:
		console.error('usage: fixtures <import|regen|adjust|compare|check|upgrade|stats> [options]');
		process.exit(2);
}
process.exit(failures ? 1 : 0);
