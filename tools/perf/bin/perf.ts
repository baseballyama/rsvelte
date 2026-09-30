#!/usr/bin/env node
// perf [--update] [--instructions] [--json <file>]
//
// The performance ratchet. Wall time moves with the machine, so what this gates is what does not:
//
// - allocations: `rsv perf` (built with `metrics`) runs every document task over the committed
//   corpus serially and counts the last, warm round's allocations and bytes, in total and per
//   phase (every artifact and task), plus the peak live-heap growth. On one thread these are a
//   function of the input and the binary, so they are compared exactly.
// - instructions (`--instructions`, Linux with valgrind): cachegrind's instruction count of the
//   shipped build (no `metrics`) for one warm round, taken as the difference between `rounds=2`
//   and `rounds=1`. Recorded per `<arch>-<os>`, compared within INSTRUCTION_TOLERANCE.
//
// The ratchet is two-sided: a counter that rose fails, and so does one that fell without the
// baseline recording it, so an improvement is locked in by the change that made it. `--update`
// writes what was measured into the baseline (instruction counts of other platforms are kept).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const BASELINE = path.join(ROOT, 'tools/perf/baseline.json');
const POPULATION = ['fixtures/svelte', 'fixtures/vue', 'fixtures/svue'];
/** Relative; cachegrind repeats itself exactly on one machine, this absorbs libc and CPU dispatch. */
const INSTRUCTION_TOLERANCE = 0.002;

interface Phase {
	calls: number;
	allocs: number;
	alloc_bytes: number;
}

interface Report {
	rev: string;
	metrics: boolean;
	documents: number;
	source_bytes: number;
	output_bytes: number;
	tasks: string[];
	allocs: number;
	alloc_bytes: number;
	peak_live_growth_bytes: number;
	phases: Record<string, Phase>;
}

interface Baseline {
	population: { documents: number; source_bytes: number; tasks: string[] };
	allocs: number;
	alloc_bytes: number;
	peak_live_growth_bytes: number;
	phases: Record<string, Phase>;
	/** One warm round's instructions, per `<arch>-<os>`. */
	instructions: Record<string, number>;
}

const { values } = parseArgs({
	options: {
		update: { type: 'boolean', default: false },
		instructions: { type: 'boolean', default: false },
		json: { type: 'string' }
	}
});

function run(cmd: string, args: string[], env: NodeJS.ProcessEnv = process.env) {
	const r = spawnSync(cmd, args, { cwd: ROOT, env, encoding: 'utf8', maxBuffer: 1 << 28 });
	if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}\n${r.stderr}`);
	return r;
}

function build(flavour: 'metrics' | 'plain'): string {
	const dir = path.join(ROOT, 'target', 'perf', flavour);
	const features = flavour === 'metrics' ? ['--features', 'metrics'] : [];
	run('cargo', ['build', '--release', '--offline', '-p', 'rsv_cli', ...features], { ...process.env, CARGO_TARGET_DIR: dir });
	return path.join(dir, 'release', 'rsv');
}

function allocations(): Report {
	const out = path.join(ROOT, 'target', 'perf', 'report.json');
	run(build('metrics'), ['perf', ...POPULATION, `json=${out}`]);
	const r = JSON.parse(fs.readFileSync(out, 'utf8')) as Report;
	if (!r.metrics || typeof r.allocs !== 'number') throw new Error('rsv perf reported no allocation counts: not a metrics build');
	if (r.documents < 1000) throw new Error(`rsv perf saw ${r.documents} documents: the corpus is missing or partial`);
	return r;
}

/** cachegrind's `I refs` of one invocation. */
function irefs(rsv: string, rounds: number): number {
	const r = run('valgrind', ['--tool=cachegrind', '--cache-sim=no', '--cachegrind-out-file=/dev/null', rsv, 'perf', ...POPULATION, `rounds=${rounds}`, 'json=/dev/null']);
	const m = /I\s+refs:\s+([\d,]+)/.exec(r.stderr);
	if (!m) throw new Error(`no "I refs" line in cachegrind's output:\n${r.stderr.slice(-2000)}`);
	return Number(m[1]!.replaceAll(',', ''));
}

function instructions(): number {
	const rsv = build('plain');
	const n = irefs(rsv, 2) - irefs(rsv, 1);
	if (!(n > 0)) throw new Error(`a warm round measured ${n} instructions`);
	return n;
}

const platform = `${process.arch}-${process.platform}`;
const report = allocations();
const instr = values.instructions ? instructions() : undefined;

const measured: Baseline = {
	population: { documents: report.documents, source_bytes: report.source_bytes, tasks: report.tasks },
	allocs: report.allocs,
	alloc_bytes: report.alloc_bytes,
	peak_live_growth_bytes: report.peak_live_growth_bytes,
	phases: report.phases,
	instructions: instr === undefined ? {} : { [platform]: instr }
};
if (values.json) fs.writeFileSync(values.json, JSON.stringify({ platform, rev: report.rev, ...measured }, null, '\t') + '\n');

const old: Baseline | undefined = fs.existsSync(BASELINE) ? (JSON.parse(fs.readFileSync(BASELINE, 'utf8')) as Baseline) : undefined;

const pct = (a: number, b: number) => (a === 0 ? (b === 0 ? '0%' : '+inf') : `${b >= a ? '+' : ''}${(((b - a) / a) * 100).toFixed(2)}%`);
const fmt = (n: number) => n.toLocaleString('en-US');

interface Row {
	metric: string;
	was: number | undefined;
	now: number | undefined;
	verdict: 'ok' | 'REGRESSED' | 'IMPROVED (baseline not updated)' | 'NEW' | 'GONE';
}

function compare(a: Baseline, b: Baseline): { rows: Row[]; population: string[] } {
	const population: string[] = [];
	if (JSON.stringify(a.population) !== JSON.stringify(b.population)) {
		population.push(`population changed: ${JSON.stringify(a.population)} -> ${JSON.stringify(b.population)}`);
	}
	const rows: Row[] = [];
	const exact = (metric: string, was: number | undefined, now: number | undefined) => {
		const verdict: Row['verdict'] =
			was === undefined ? 'NEW' : now === undefined ? 'GONE' : now > was ? 'REGRESSED' : now < was ? 'IMPROVED (baseline not updated)' : 'ok';
		rows.push({ metric, was, now, verdict });
	};
	exact('allocs', a.allocs, b.allocs);
	exact('alloc_bytes', a.alloc_bytes, b.alloc_bytes);
	exact('peak_live_growth_bytes', a.peak_live_growth_bytes, b.peak_live_growth_bytes);
	for (const name of [...new Set([...Object.keys(a.phases), ...Object.keys(b.phases)])].sort()) {
		for (const k of ['calls', 'allocs', 'alloc_bytes'] as const) exact(`phase ${name} ${k}`, a.phases[name]?.[k], b.phases[name]?.[k]);
	}
	const now = b.instructions[platform];
	if (now !== undefined) {
		const was = a.instructions[platform];
		const verdict: Row['verdict'] =
			was === undefined
				? 'NEW'
				: now > was * (1 + INSTRUCTION_TOLERANCE)
					? 'REGRESSED'
					: now < was * (1 - INSTRUCTION_TOLERANCE)
						? 'IMPROVED (baseline not updated)'
						: 'ok';
		rows.push({ metric: `instructions ${platform}`, was, now, verdict });
	}
	return { rows, population };
}

console.log(`rsv perf at ${report.rev}: ${fmt(report.documents)} documents, ${fmt(report.source_bytes)} bytes, ${report.tasks.length} tasks`);
console.log(`  allocs ${fmt(report.allocs)} (${((report.allocs / report.source_bytes) * 1000).toFixed(2)} per KB), bytes ${fmt(report.alloc_bytes)}, peak live +${fmt(report.peak_live_growth_bytes)}`);
if (instr !== undefined) console.log(`  instructions (${platform}, one warm round) ${fmt(instr)} (${(instr / report.source_bytes).toFixed(1)} per source byte)`);

if (values.update) {
	const next: Baseline = { ...measured, instructions: { ...(old?.instructions ?? {}), ...measured.instructions } };
	fs.writeFileSync(BASELINE, JSON.stringify(next, null, '\t') + '\n');
	if (old) {
		for (const r of compare(old, next).rows.filter((r) => r.verdict !== 'ok')) {
			console.log(`  ${r.metric}: ${r.was === undefined ? '-' : fmt(r.was)} -> ${r.now === undefined ? '-' : fmt(r.now)}`);
		}
	}
	console.log(`wrote ${path.relative(ROOT, BASELINE)}`);
	process.exit(0);
}

if (!old) {
	console.error(`no baseline at ${path.relative(ROOT, BASELINE)}; run with --update`);
	process.exit(1);
}
if (instr === undefined && old.instructions[platform] !== undefined) {
	console.log(`  instructions ${platform}: UNMEASURED (pass --instructions)`);
}
const { rows, population } = compare(old, measured);
const bad = rows.filter((r) => r.verdict !== 'ok');
for (const p of population) console.error(`FAIL ${p}`);
for (const r of bad) {
	const was = r.was === undefined ? '-' : fmt(r.was);
	const now = r.now === undefined ? '-' : fmt(r.now);
	const delta = r.was !== undefined && r.now !== undefined ? ` (${pct(r.was, r.now)})` : '';
	console.error(`FAIL ${r.metric}: ${was} -> ${now}${delta} ${r.verdict}`);
}
console.log(`${rows.length} counters compared, ${bad.length} moved${population.length ? ', population changed' : ''}`);
if (bad.length || population.length) {
	console.error('the ratchet is two-sided: record an intended change with `mise run perf:update` (and --instructions on Linux)');
	process.exit(1);
}
