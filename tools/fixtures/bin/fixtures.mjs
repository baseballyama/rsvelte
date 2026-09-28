#!/usr/bin/env node
// fixtures import  --from <dir> [--source id,...] [--accept-commit]
// fixtures regen   [--task id,...] [--source id,...]
// fixtures adjust  [--write]
// fixtures compare --task id --variant id --candidate <dir> [--source id,...] [--report <file>]
// fixtures upgrade    regen every task, then re-validate adjustments (after bumping an oracle in package.json)
// fixtures stats
import fs from 'node:fs';
import path from 'node:path';
import { runImport } from '../src/import.mjs';
import { regen } from '../src/regen.mjs';
import { verifyAdjustments } from '../src/adjust.mjs';
import { compare } from '../src/compare.mjs';
import { allUnits, applies, includedSources } from '../src/manifest.mjs';
import { TASKS } from '../src/tasks/index.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i++) {
	const a = rest[i];
	if (!a.startsWith('--')) throw new Error(`unexpected argument ${a}`);
	const next = rest[i + 1];
	if (next === undefined || next.startsWith('--')) args[a.slice(2)] = true;
	else args[a.slice(2)] = (i++, next);
}
const list = (v) => (typeof v === 'string' ? v.split(',') : undefined);

function reportAdjustments(write) {
	const r = verifyAdjustments({ write });
	console.log(`adjustments: ${r.files} file(s) ${JSON.stringify(r.counts)}`);
	for (const p of r.problems) console.log(`  ${p}`);
	return r.counts.stale + r.counts.redundant + (write ? 0 : r.counts.rebased);
}

let failures = 0;
switch (cmd) {
	case 'import': {
		if (typeof args.from !== 'string') throw new Error('--from <dir holding the source checkouts> is required');
		runImport({ from: path.resolve(args.from), only: list(args.source), acceptCommit: !!args['accept-commit'] });
		break;
	}
	case 'regen': {
		const r = regen({ taskIds: list(args.task), sourceIds: list(args.source) });
		failures += r.unparseable.length;
		break;
	}
	case 'upgrade': {
		const r = regen({});
		failures += r.unparseable.length;
		failures += reportAdjustments(false);
		console.log('review `git diff --stat fixtures/expected`: every changed snapshot is an upstream behaviour change');
		break;
	}
	case 'adjust':
		failures += reportAdjustments(!!args.write);
		break;
	case 'compare': {
		for (const k of ['task', 'variant', 'candidate']) if (typeof args[k] !== 'string') throw new Error(`--${k} is required`);
		const r = compare({ taskId: args.task, variantId: args.variant, candidate: path.resolve(args.candidate), sourceIds: list(args.source) });
		console.log(`units: ${r.units}  ${JSON.stringify(r.counts)}`);
		const bad = r.rows.filter((x) => x.verdict !== 'match');
		const lines = bad.map((x) => `${x.verdict.padEnd(11)} ${x.key} [${x.ext}]${x.detail ? ` ${x.detail}` : ''}`);
		if (typeof args.report === 'string') fs.writeFileSync(args.report, lines.join('\n') + '\n');
		const SHOW = 20;
		for (const l of lines.slice(0, SHOW)) console.log(`  ${l}`);
		if (lines.length > SHOW) console.log(`  … and ${lines.length - SHOW} more${args.report ? ` (all in ${args.report})` : ' (pass --report <file> for all)'}`);
		failures += bad.length;
		break;
	}
	case 'stats': {
		const units = allUnits();
		const by = (f) => units.reduce((m, u) => ((m[f(u)] = (m[f(u)] ?? 0) + 1), m), {});
		console.log(`sources: ${includedSources().length}  units: ${units.length}`);
		console.log('by lang:', by((u) => u.lang));
		console.log('by inferredMode (svelte):', by((u) => (u.lang === 'svelte' ? u.inferredMode : '-')));
		for (const t of TASKS) for (const v of t.variants) console.log(`task ${t.id}/${v.id}: ${units.filter((u) => applies(t, v.id, u)).length} units (${t.storage})`);
		break;
	}
	default:
		console.error('usage: fixtures <import|regen|adjust|compare|upgrade|stats> [options]');
		process.exit(2);
}
process.exit(failures ? 1 : 0);
