// The performance ratchet. Wall time moves with the machine, so what this gates is what does not:
//
// - allocations: `rsvelte performance` (built with `metrics`) runs every document task over the committed
//   corpus serially and counts the last, warm round's allocations and bytes, in total and per
//   phase (every artifact and task), plus the peak live-heap growth. On one thread these are a
//   function of the input and the binary, so they are compared exactly.
// - instructions (`--instructions`, Linux with valgrind): cachegrind's instruction counts of the
//   shipped build (no `metrics`), recorded per `<arch>-<os>` and compared within
//   INSTRUCTION_TOLERANCE: one warm round, taken as the difference between `rounds=2` and
//   `rounds=1`, and loading (`rounds=0`: start-up, reading the files and constructing the
//   documents), which every invocation pays. cachegrind runs some fifty times slower than the
//   machine, so these count every INSTRUCTION_SAMPLE-th unit of the corpus in name order, not the
//   corpus; the three runs go at once, beside the allocation run.
//
// The ratchet is two-sided: a counter that rose fails, and so does one that fell without the
// baseline recording it, so an improvement is locked in by the change that made it. `--update`
// writes what was measured into the baseline (instruction counts of other platforms are kept).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

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
	/** Loading's instructions (`rounds=0`), per `<arch>-<os>`. */
	load_instructions: Record<string, number>;
	/** What the instructions count: every `every`-th unit; absent: every unit. */
	instruction_sample?: Sample;
}

interface Sample {
	every: number;
	documents: number;
	source_bytes: number;
}

interface Row {
	metric: string;
	was: number | undefined;
	now: number | undefined;
	verdict: 'ok' | 'REGRESSED' | 'IMPROVED (baseline not updated)' | 'NEW' | 'GONE';
}

const fmt = (n: number) => n.toLocaleString('en-US');

const pct = (a: number, b: number) =>
	a === 0 ? (b === 0 ? '0%' : '+inf') : `${b >= a ? '+' : ''}${(((b - a) / a) * 100).toFixed(2)}%`;

function took(cmd: string, argv: string[], started: number) {
	// A slow CI job names its slow step.
	const seconds = ((performance.now() - started) / 1000).toFixed(1);
	console.error(`  ${seconds} s: ${path.basename(cmd)} ${argv.slice(0, 6).join(' ')}`);
}

/** The corpus units (directories holding an `input.<ext>`) below `root`, in name order. */
function units(root: string): string[] {
	const found: string[] = [];
	const visit = (dir: string) => {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		if (entries.some((e) => e.isFile() && e.name.startsWith('input.'))) {
			found.push(dir);
			return;
		}
		for (const e of entries.toSorted((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)))
			if (e.isDirectory()) visit(path.join(dir, e.name));
	};
	visit(root);
	return found;
}

export async function main(args: string[]): Promise<void> {
	const ROOT = path.resolve(import.meta.dirname, '../..');
	const BASELINE = path.join(ROOT, 'tools/performance/baseline.json');
	const POPULATION = ['corpus/svelte'];
	/** Relative; cachegrind repeats itself exactly on one machine, this absorbs libc and CPU dispatch. */
	const INSTRUCTION_TOLERANCE = 0.002;
	/** Instructions count every this-th corpus unit. */
	const INSTRUCTION_SAMPLE = 20;

	const { values } = parseArgs({
		args,
		options: {
			update: { type: 'boolean', default: false },
			instructions: { type: 'boolean', default: false },
			json: { type: 'string' },
		},
	});

	/** Runs a command; resolves with its stderr. */
	function start(
		cmd: string,
		argv: string[],
		env: NodeJS.ProcessEnv = process.env,
	): Promise<string> {
		const started = performance.now();
		return new Promise((resolve, reject) => {
			const child = spawn(cmd, argv, { cwd: ROOT, env, stdio: ['ignore', 'ignore', 'pipe'] });
			let stderr = '';
			child.stderr.setEncoding('utf8').on('data', (chunk: string) => (stderr += chunk));
			child.on('error', reject);
			child.on('close', (status) => {
				if (status !== 0) {
					reject(new Error(`${cmd} ${argv.join(' ')} exited ${status}\n${stderr}`));
					return;
				}
				took(cmd, argv, started);
				resolve(stderr);
			});
		});
	}

	/**
	 * A private copy, so a later build cannot swap the binary while it is measured. Each flavour
	 * has its own target directory, so the two builds run at once.
	 */
	async function build(flavour: 'metrics' | 'plain', directory: string): Promise<string> {
		const dir = path.join(ROOT, 'target', `performance-${flavour}`);
		const features = flavour === 'metrics' ? ['--features', 'metrics'] : [];
		await start(
			'cargo',
			['build', '--release', '--offline', '-p', 'rsvelte_command_line', ...features],
			{
				...process.env,
				CARGO_TARGET_DIR: dir,
			},
		);
		fs.mkdirSync(path.join(directory, flavour));
		const copy = path.join(directory, flavour, 'rsvelte');
		fs.copyFileSync(path.join(dir, 'release', 'rsvelte'), copy);
		return copy;
	}

	async function allocations(rsvelte: string, directory: string): Promise<Report> {
		const out = path.join(directory, 'report.json');
		await start(rsvelte, ['performance', ...POPULATION, `json=${out}`]);
		const r = JSON.parse(fs.readFileSync(out, 'utf8')) as Report;
		if (!r.metrics || typeof r.allocs !== 'number')
			throw new Error('rsvelte performance reported no allocation counts: not a metrics build');
		if (r.documents < 1000)
			throw new Error(
				`rsvelte performance saw ${r.documents} documents: the corpus is missing or partial`,
			);
		return r;
	}

	/** cachegrind's `I refs` of one invocation over the sample. */
	async function irefs(rsvelte: string, sample: string[], rounds: number): Promise<number> {
		const stderr = await start('valgrind', [
			'--tool=cachegrind',
			'--cache-sim=no',
			'--cachegrind-out-file=/dev/null',
			rsvelte,
			'performance',
			...sample,
			`rounds=${rounds}`,
			'json=/dev/null',
		]);
		const m = /I\s+refs:\s+([\d,]+)/.exec(stderr);
		if (!m) throw new Error(`no "I refs" line in cachegrind's output:\n${stderr.slice(-2000)}`);
		return Number(m[1]!.replaceAll(',', ''));
	}

	async function instructions(
		rsvelte: string,
	): Promise<{ warm: number; load: number; sample: Sample }> {
		const all = POPULATION.flatMap((p) => units(path.join(ROOT, p)));
		const sample = all
			.filter((_, i) => i % INSTRUCTION_SAMPLE === 0)
			.map((u) => path.relative(ROOT, u));
		const sourceBytes = sample
			.flatMap((u) =>
				fs
					.readdirSync(path.join(ROOT, u))
					.filter((f) => f.startsWith('input.'))
					.map((f) => fs.statSync(path.join(ROOT, u, f)).size),
			)
			.reduce((a, b) => a + b, 0);
		const [load, one, two] = await Promise.all(
			[0, 1, 2].map((rounds) => irefs(rsvelte, sample, rounds)),
		);
		const warm = two! - one!;
		if (!(load! > 0 && one! > load! && two! > one!))
			throw new Error(
				`counts that do not grow with the rounds: rounds=0 ${load}, rounds=1 ${one}, rounds=2 ${two}`,
			);
		return {
			warm,
			load: load!,
			sample: { every: INSTRUCTION_SAMPLE, documents: sample.length, source_bytes: sourceBytes },
		};
	}

	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-performance-'));
	let report: Report;
	let instr: { warm: number; load: number; sample: Sample } | undefined;
	try {
		// rustup installs a missing toolchain on first use; two builds at once would both download it.
		await start('cargo', ['--version']);
		// Each measurement starts as soon as its own build is done.
		[report, instr] = await Promise.all([
			build('metrics', directory).then((metrics) => allocations(metrics, directory)),
			values.instructions ? build('plain', directory).then(instructions) : undefined,
		]);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}

	const platform = `${process.arch}-${process.platform}`;

	const measured: Baseline = {
		population: {
			documents: report.documents,
			source_bytes: report.source_bytes,
			tasks: report.tasks,
		},
		allocs: report.allocs,
		alloc_bytes: report.alloc_bytes,
		peak_live_growth_bytes: report.peak_live_growth_bytes,
		phases: report.phases,
		instructions: instr === undefined ? {} : { [platform]: instr.warm },
		load_instructions: instr === undefined ? {} : { [platform]: instr.load },
		...(instr === undefined ? {} : { instruction_sample: instr.sample }),
	};
	if (values.json)
		fs.writeFileSync(
			values.json,
			JSON.stringify({ platform, rev: report.rev, ...measured }, null, '\t') + '\n',
		);

	const old: Baseline | undefined = fs.existsSync(BASELINE)
		? (JSON.parse(fs.readFileSync(BASELINE, 'utf8')) as Baseline)
		: undefined;

	function compare(a: Baseline, b: Baseline): { rows: Row[]; population: string[] } {
		const population: string[] = [];
		if (
			b.instruction_sample !== undefined &&
			JSON.stringify(a.instruction_sample) !== JSON.stringify(b.instruction_sample)
		) {
			population.push(
				`instruction sample changed: ${JSON.stringify(a.instruction_sample ?? 'every unit')} -> ${JSON.stringify(b.instruction_sample)}`,
			);
		}
		if (JSON.stringify(a.population) !== JSON.stringify(b.population)) {
			population.push(
				`population changed: ${JSON.stringify(a.population)} -> ${JSON.stringify(b.population)}`,
			);
		}
		const rows: Row[] = [];
		const exact = (metric: string, was: number | undefined, now: number | undefined) => {
			const verdict: Row['verdict'] =
				was === undefined
					? 'NEW'
					: now === undefined
						? 'GONE'
						: now > was
							? 'REGRESSED'
							: now < was
								? 'IMPROVED (baseline not updated)'
								: 'ok';
			rows.push({ metric, was, now, verdict });
		};
		exact('allocs', a.allocs, b.allocs);
		exact('alloc_bytes', a.alloc_bytes, b.alloc_bytes);
		exact('peak_live_growth_bytes', a.peak_live_growth_bytes, b.peak_live_growth_bytes);
		for (const name of [
			...new Set([...Object.keys(a.phases), ...Object.keys(b.phases)]),
		].toSorted()) {
			for (const k of ['calls', 'allocs', 'alloc_bytes'] as const)
				exact(`phase ${name} ${k}`, a.phases[name]?.[k], b.phases[name]?.[k]);
		}
		for (const [key, label] of [
			['instructions', 'instructions'],
			['load_instructions', 'load instructions'],
		] as const) {
			const now = b[key][platform];
			if (now === undefined) continue;
			const was = a[key]?.[platform];
			const verdict: Row['verdict'] =
				was === undefined
					? 'NEW'
					: now > was * (1 + INSTRUCTION_TOLERANCE)
						? 'REGRESSED'
						: now < was * (1 - INSTRUCTION_TOLERANCE)
							? 'IMPROVED (baseline not updated)'
							: 'ok';
			rows.push({ metric: `${label} ${platform}`, was, now, verdict });
		}
		return { rows, population };
	}

	console.log(
		`rsvelte performance at ${report.rev}: ${fmt(report.documents)} documents, ${fmt(report.source_bytes)} bytes, ${report.tasks.length} tasks`,
	);
	console.log(
		`  allocs ${fmt(report.allocs)} (${((report.allocs / report.source_bytes) * 1000).toFixed(2)} per KB), bytes ${fmt(report.alloc_bytes)}, peak live +${fmt(report.peak_live_growth_bytes)}`,
	);
	if (instr !== undefined) {
		const { every, documents, source_bytes } = instr.sample;
		console.log(
			`  instructions over every ${every}th unit (${fmt(documents)} documents, ${fmt(source_bytes)} bytes):`,
		);
		console.log(
			`    one warm round (${platform}) ${fmt(instr.warm)} (${(instr.warm / source_bytes).toFixed(1)} per source byte)`,
		);
		console.log(
			`    loading (${platform}) ${fmt(instr.load)} (${(instr.load / source_bytes).toFixed(1)} per source byte)`,
		);
	}

	if (values.update) {
		const next: Baseline = {
			...measured,
			instructions: { ...old?.instructions, ...measured.instructions },
			load_instructions: { ...old?.load_instructions, ...measured.load_instructions },
			...(old?.instruction_sample === undefined
				? {}
				: { instruction_sample: old.instruction_sample }),
			...(measured.instruction_sample === undefined
				? {}
				: { instruction_sample: measured.instruction_sample }),
		};
		fs.writeFileSync(BASELINE, JSON.stringify(next, null, '\t') + '\n');
		if (old) {
			for (const row of compare(old, next).rows.filter((r) => r.verdict !== 'ok')) {
				console.log(
					`  ${row.metric}: ${row.was === undefined ? '-' : fmt(row.was)} -> ${row.now === undefined ? '-' : fmt(row.now)}`,
				);
			}
		}
		console.log(`wrote ${path.relative(ROOT, BASELINE)}`);
		process.exit(0);
	}

	if (!old) {
		console.error(`no baseline at ${path.relative(ROOT, BASELINE)}; run with --update`);
		process.exit(1);
	}
	if (
		instr === undefined &&
		(old.instructions[platform] !== undefined || old.load_instructions?.[platform] !== undefined)
	) {
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
	console.log(
		`${rows.length} counters compared, ${bad.length} moved${population.length ? ', population changed' : ''}`,
	);
	if (bad.length || population.length) {
		console.error(
			'the ratchet is two-sided: record an intended change with `mise run performance:update` (and --instructions on Linux)',
		);
		process.exit(1);
	}
}
