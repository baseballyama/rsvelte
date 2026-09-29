#!/usr/bin/env node
// buildtime [--rounds N] [--only name,...] [--json <file>] [--timings] [--allow-busy]
//
// Measures how long this workspace takes to compile, as a metric of its own. Every scenario runs in
// a target directory of its own (target/buildtime/<scenario>), so nothing here reuses or disturbs
// ./target, and scenarios are interleaved round by round so machine drift spreads over all of them.
//
// Clean scenarios delete their target directory first; dependencies come from the local registry
// cache (--offline), so download time is never in a number. Incremental scenarios first warm their
// directory untimed, then edit one file, time the rebuild, restore the file and rebuild untimed.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const BASE = path.join(ROOT, 'target', 'buildtime');

type Edit = {
	/** `touch`: the bytes stay, only the mtime moves (the floor of an edit-compile cycle).
	 *  `body`: a private function is added (nothing public changes).
	 *  `api`: a public item is added (every dependent crate recompiles). */
	kind: 'touch' | 'body' | 'api';
	file: string;
};

type Scenario = {
	name: string;
	description: string;
	cargo: string[];
	edit?: Edit;
};

const WS = ['--workspace', '--all-targets', '--all-features'];

const SCENARIOS: Scenario[] = [
	{ name: 'check.clean', description: 'cargo check, every target, from nothing', cargo: ['check', ...WS] },
	{ name: 'clippy.clean', description: 'the lint gate, from nothing', cargo: ['clippy', ...WS] },
	{ name: 'debug.clean', description: 'debug build of every target (tests included), from nothing', cargo: ['build', ...WS] },
	{ name: 'release.clean', description: 'the shipped `rsv` binary (release: thin LTO, one codegen unit)', cargo: ['build', '--release', '-p', 'rsv_cli'] },
	...(
		[
			['kernel', 'crates/rsv_kernel/src/lib.rs'],
			['svelte', 'crates/rsv_svelte/src/lib.rs']
		] as const
	).flatMap(([crate, file]) =>
		(['touch', 'body', 'api'] as const).map(
			(kind): Scenario => ({
				name: `debug.incr.${crate}.${kind}`,
				description: `debug build of every target after a \`${kind}\` edit to ${file}`,
				cargo: ['build', ...WS],
				edit: { kind, file }
			})
		)
	)
];

const { values } = parseArgs({
	options: {
		rounds: { type: 'string', default: '3' },
		only: { type: 'string' },
		json: { type: 'string' },
		timings: { type: 'boolean', default: false },
		'allow-busy': { type: 'boolean', default: false }
	}
});

const rounds = Number(values.rounds);
if (!Number.isInteger(rounds) || rounds < 1) throw new Error(`--rounds must be a positive integer, got ${values.rounds}`);
const only = values.only?.split(',');
const scenarios = only ? SCENARIOS.filter((s) => only.includes(s.name)) : SCENARIOS;
if (only && scenarios.length !== only.length) {
	const known = new Set(SCENARIOS.map((s) => s.name));
	throw new Error(`unknown scenario: ${only.filter((n) => !known.has(n)).join(', ')}\nknown: ${[...known].join(', ')}`);
}

function run(cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): string {
	const r = spawnSync(cmd, args, { cwd: opts.cwd ?? ROOT, env: opts.env ?? process.env, encoding: 'utf8' });
	if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}\n${r.stderr}`);
	return r.stdout.trim();
}

function cargo(s: Scenario, extra: string[] = []): { seconds: number; packages: number } {
	const env: NodeJS.ProcessEnv = { ...process.env, CARGO_TARGET_DIR: path.join(BASE, s.name) };
	delete env.RUSTC_WRAPPER;
	const t0 = process.hrtime.bigint();
	const r = spawnSync('cargo', [...s.cargo, '--offline', ...extra], { cwd: ROOT, env, encoding: 'utf8' });
	const seconds = Number(process.hrtime.bigint() - t0) / 1e9;
	if (r.status !== 0) throw new Error(`${s.name}: cargo exited ${r.status}\n${r.stderr}`);
	// Cargo prints one `Compiling`/`Checking` line per package it ran rustc for (once, however many
	// of its targets rebuilt); the count tells a real rebuild from a no-op, which a duration cannot.
	const packages = r.stderr.split('\n').filter((l) => /^\s*(Compiling|Checking) /.test(l)).length;
	return { seconds, packages };
}

function edited(src: string, kind: Edit['kind'], nonce: number): string {
	const probe =
		kind === 'api'
			? `\n#[doc(hidden)]\npub const BUILDTIME_PROBE: u64 = ${nonce};\n`
			: `\n#[allow(dead_code)]\nfn buildtime_probe() -> u64 {\n    ${nonce}\n}\n`;
	return kind === 'touch' ? src : src + probe;
}

function measure(s: Scenario): { seconds: number; packages: number; load1: number } {
	const dir = path.join(BASE, s.name);
	const load1 = os.loadavg()[0] ?? 0;
	if (!s.edit) {
		fs.rmSync(dir, { recursive: true, force: true });
		return { ...cargo(s), load1 };
	}
	const file = path.join(ROOT, s.edit.file);
	const original = fs.readFileSync(file);
	cargo(s);
	try {
		// A body edit must differ from the previous round's, or rustc's incremental cache has seen it.
		fs.writeFileSync(file, edited(original.toString('utf8'), s.edit.kind, Date.now()));
		const now = new Date();
		fs.utimesSync(file, now, now);
		const r = cargo(s);
		return { ...r, load1: os.loadavg()[0] ?? load1 };
	} finally {
		fs.writeFileSync(file, original);
		const now = new Date();
		fs.utimesSync(file, now, now);
	}
}

function busiest(): string {
	return run('ps', ['-Ao', '%cpu=,comm='])
		.split('\n')
		.map((l) => l.trim().split(/\s+/))
		.map(([cpu, ...cmd]) => [Number(cpu), cmd.join(' ')] as const)
		.sort((a, b) => b[0] - a[0])
		.slice(0, 3)
		.map(([cpu, cmd]) => `${cpu}% ${path.basename(cmd)}`)
		.join(', ');
}

const median = (xs: number[]): number => {
	const s = [...xs].sort((a, b) => a - b);
	const m = s.length >> 1;
	return s.length % 2 ? (s[m] as number) : ((s[m - 1] as number) + (s[m] as number)) / 2;
};

// An edit scenario writes to a tracked source file and restores it; refuse when that file already
// has changes, so a crash between the two can never cost uncommitted work.
for (const s of scenarios) {
	if (s.edit && run('git', ['status', '--porcelain', '--', s.edit.file]) !== '')
		throw new Error(`${s.edit.file} has uncommitted changes; ${s.name} edits and restores it`);
}

const cores = os.availableParallelism();
const load0 = os.loadavg()[0] ?? 0;
if (load0 > cores / 4 && !values['allow-busy'])
	throw new Error(`load average ${load0.toFixed(1)} on ${cores} cores (busiest: ${busiest()}); wait, or pass --allow-busy`);

const rustc = run('rustc', ['-vV']);
const env = {
	gitRev: run('git', ['rev-parse', 'HEAD']),
	// Only tracked Rust sources and build configuration decide what is compiled.
	dirty: run('git', ['status', '--porcelain', '--untracked-files=no', '--', 'crates', 'Cargo.toml', 'Cargo.lock', 'rust-toolchain.toml']) !== '',
	rustc: rustc.split('\n')[0],
	host: /host: (.*)/.exec(rustc)?.[1],
	cargo: run('cargo', ['-V']),
	cpu: os.cpus()[0]?.model,
	cores,
	memGiB: Math.round(os.totalmem() / 2 ** 30),
	os: `${os.type()} ${os.release()}`,
	rustflags: process.env.RUSTFLAGS ?? null,
	incremental: process.env.CARGO_INCREMENTAL ?? null
};
console.error(`${env.gitRev.slice(0, 10)}${env.dirty ? ' (dirty)' : ''} · ${env.rustc} · ${cores} cores · load ${load0.toFixed(1)}`);

// load1 includes the build being measured, so only the value before the first run says whether the
// machine was otherwise idle.
const samples = new Map<string, { seconds: number; packages: number; load1: number }[]>(scenarios.map((s) => [s.name, []]));
for (let round = 0; round < rounds; round++) {
	for (const s of scenarios) {
		const r = measure(s);
		samples.get(s.name)?.push(r);
		console.error(`round ${round + 1}/${rounds}  ${s.name.padEnd(26)} ${r.seconds.toFixed(2).padStart(7)} s  ${String(r.packages).padStart(3)} packages  load ${r.load1.toFixed(1)}`);
		if (s.edit && r.packages === 0) throw new Error(`${s.name}: the edit rebuilt nothing; the scenario measures a no-op`);
	}
}

// `--timings` slows the build it reports on, so its runs are extra and never samples.
if (values.timings) {
	for (const s of scenarios.filter((x) => !x.edit)) {
		const dir = path.join(BASE, s.name);
		fs.rmSync(dir, { recursive: true, force: true });
		cargo(s, ['--timings']);
		fs.cpSync(path.join(dir, 'cargo-timings'), path.join(BASE, 'timings', s.name), { recursive: true });
	}
}

const result = {
	schema: 1,
	when: new Date().toISOString(),
	rounds,
	env,
	scenarios: scenarios.map((s) => {
		const xs = samples.get(s.name) ?? [];
		const secs = xs.map((x) => x.seconds);
		return {
			name: s.name,
			description: s.description,
			command: `cargo ${[...s.cargo, '--offline'].join(' ')}`,
			medianSeconds: Number(median(secs).toFixed(3)),
			minSeconds: Number(Math.min(...secs).toFixed(3)),
			maxSeconds: Number(Math.max(...secs).toFixed(3)),
			packages: median(xs.map((x) => x.packages)),
			samples: xs.map((x) => ({ seconds: Number(x.seconds.toFixed(3)), packages: x.packages, load1: Number(x.load1.toFixed(2)) }))
		};
	})
};

console.error('');
for (const s of result.scenarios)
	console.error(`${s.name.padEnd(26)} median ${s.medianSeconds.toFixed(2).padStart(7)} s  [${s.minSeconds.toFixed(2)} – ${s.maxSeconds.toFixed(2)}]  ${s.packages} packages`);
if (values.timings) console.error(`\ncargo --timings reports (clean scenarios): ${path.join(BASE, 'timings')}`);

const out = JSON.stringify(result, null, '\t') + '\n';
if (values.json) fs.writeFileSync(values.json, out);
else process.stdout.write(out);
