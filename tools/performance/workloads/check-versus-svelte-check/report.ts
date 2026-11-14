// `report.ts <results directory> <report.md> <report.json>`: pools the JSON that `measure.ts`
// writes, one file per job, into one report. A speedup is the median of per-round ratios (both
// arms ran in the same round), with a percentile-bootstrap 95% confidence interval, so drift
// between rounds stays out of the ratio. Replicas run on separate machines; the report pools them
// and lists each replica's median beside the pooled one.
import fs from 'node:fs';
import path from 'node:path';

const ARMS = [
	'svelte-check-ts6',
	'svelte-check-tsgo',
	'svelte-check-tsrs',
	'rsvelte-tsgo',
	'rsvelte-tsrs',
	'rsvelte-tsrs-fast',
];
const PAIRS: [string, string, string][] = [
	['svelte-check-tsgo', 'rsvelte-tsrs', 'headline: official TS 7.1 → rsvelte + tsrs'],
	['svelte-check-tsgo', 'rsvelte-tsgo', 'content mapper and host (both tsgo)'],
	['rsvelte-tsgo', 'rsvelte-tsrs', 'type checker (both rsvelte projections)'],
	['svelte-check-tsgo', 'svelte-check-tsrs', 'type checker (both svelte2tsx)'],
	['rsvelte-tsrs', 'rsvelte-tsrs-fast', 'tsrs default → TSRS_FAST=1'],
	['svelte-check-ts6', 'svelte-check-tsgo', 'svelte-check TS 6 → TS 7.1'],
	['svelte-check-ts6', 'rsvelte-tsrs', 'today (svelte-check TS 6) → rsvelte + tsrs'],
];

type Sample = {
	round: number;
	wallMs: number;
	treeCpuMs: number;
	userMs: number;
	sysMs: number;
	treePeakRssKiB: number;
};
type ArmResult = {
	label: string;
	typescript: string;
	files: number | null;
	errors: number | null;
	errorsByCode: Record<string, number> | null;
	failures: Record<string, number> | null;
	digest: string | null;
	warm: Sample[];
	cold: Sample[];
	broken: { phase: string; round: number; problem: string; stderr: string }[];
};
type Job = {
	env: Record<string, any>;
	control: { expectedFiles: number; arms: Record<string, { ok: boolean }> } | null;
	agreement: Record<string, any>;
	arms: Record<string, ArmResult>;
};

const quantile = (sorted: number[], q: number) => {
	if (!sorted.length) return Number.NaN;
	const at = (sorted.length - 1) * q;
	const lo = Math.floor(at);
	const hi = Math.ceil(at);
	return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (at - lo);
};
const median = (xs: number[]) =>
	quantile(
		xs.toSorted((a, b) => a - b),
		0.5,
	);

function bootstrapCi(xs: number[], iterations = 10000): [number, number] {
	if (xs.length < 3) return [Number.NaN, Number.NaN];
	let state = 42;
	const random = () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const medians: number[] = [];
	const buffer = Array.from({ length: xs.length }, () => 0);
	for (let i = 0; i < iterations; i++) {
		for (let j = 0; j < xs.length; j++) buffer[j] = xs[Math.floor(random() * xs.length)]!;
		medians.push(median(buffer));
	}
	medians.sort((a, b) => a - b);
	return [quantile(medians, 0.025), quantile(medians, 0.975)];
}

function describe(xs: number[]) {
	const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
	const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, xs.length - 1));
	const sorted = xs.toSorted((a, b) => a - b);
	return {
		n: xs.length,
		median: quantile(sorted, 0.5),
		ci95: bootstrapCi(xs),
		cv: xs.length > 1 ? sd / mean : Number.NaN,
		min: sorted[0] ?? Number.NaN,
		max: sorted.at(-1) ?? Number.NaN,
	};
}

const f = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : '–');
const codes = (counts: Record<string, number> | null | undefined, limit = 6) =>
	counts
		? Object.entries(counts)
				.slice(0, limit)
				.map(([code, n]) => `${code}×${n}`)
				.join(' ') || 'none'
		: '–';

const [directory, markdownFile, jsonFile] = process.argv.slice(2);
if (!directory || !markdownFile || !jsonFile)
	throw new Error('usage: report.ts <results directory> <report.md> <report.json>');
const jobs: Job[] = fs
	.readdirSync(directory, { recursive: true, encoding: 'utf8' })
	.filter((file) => file.endsWith('.json'))
	.map((file) => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')))
	.filter((job) => job.env);
const projects = new Map<string, Job[]>();
for (const job of jobs) projects.set(job.env.id, [...(projects.get(job.env.id) ?? []), job]);
const order = [...projects.keys()].toSorted((a, b) => {
	const na = /^synthetic-(\d+)$/.exec(a);
	const nb = /^synthetic-(\d+)$/.exec(b);
	if (na && nb) return Number(na[1]) - Number(nb[1]);
	if (na || nb) return na ? -1 : 1;
	return a.localeCompare(b);
});

const md: string[] = ['# Type checking: svelte-check versus rsvelte\n'];
const first = jobs[0]?.env;
if (first)
	md.push(
		`- rsvelte \`${first.rsvelteRevision}\`; language-tools \`${first.languageToolsRevision}\` (sveltejs/language-tools#3193)`,
		`- svelte-check ${first.svelteCheck} with TypeScript ${first.typescript6}; tsgo \`${first.tsgo}\`; tsrs \`${first.tsrs}\``,
		`- ${first.platform}, ${first.cpus} CPUs (${first.cpu}), ${first.memoryGiB} GiB, ${first.runnerImage ?? ''}, Node ${first.node}`,
		`- ${first.protocol.warmup} warm-up rounds, ${first.protocol.rounds} measured rounds in a shuffled arm order, ${first.protocol.cold} cold rounds (page cache dropped before each run), per job; TypeScript diagnostics only (\`--diagnostic-sources js\`)`,
		'',
	);
const headline: string[] = [];
const summary: Record<string, unknown> = {};

for (const id of order) {
	const replicas = projects.get(id)!;
	const env = replicas[0]!.env;
	const project: Record<string, any> = { env, arms: {}, speedups: {} };
	md.push(`## ${id}\n`);
	md.push(
		`${env.programComponents} components in the program (${env.programComponentsInNodeModules} in node_modules), ${env.programFiles} files rsvelte checks, ${env.svelteFilesOnDisk} \`.svelte\` files on disk · project TypeScript ${env.projectTypescript ?? '–'} · Svelte ${env.projectSvelte} · ${replicas.length} job(s)\n`,
	);
	md.push(
		'| arm | warm median (s) | 95% CI | CV | CPU (s) | peak memory (MiB) | cold median (s) | files | TS errors | top codes | broken |',
	);
	md.push('|---|---:|---|---:|---:|---:|---:|---:|---:|---|---|');
	for (const arm of ARMS) {
		const all = replicas.map((job) => job.arms[arm]).filter((a): a is ArmResult => !!a);
		if (!all.length) continue;
		const warm = all.flatMap((a) => a.warm);
		const w = describe(warm.map((s) => s.wallMs / 1000));
		const c = describe(all.flatMap((a) => a.cold).map((s) => s.wallMs / 1000));
		const cpu = median(warm.map((s) => Math.max(s.treeCpuMs, s.userMs + s.sysMs) / 1000));
		const rss = median(warm.map((s) => s.treePeakRssKiB / 1024));
		const broken = all.flatMap((a) => a.broken);
		const digests = [...new Set(all.map((a) => a.digest).filter(Boolean))];
		const reference = all.find((a) => a.digest) ?? all[0]!;
		project.arms[arm] = {
			label: reference.label,
			typescript: reference.typescript,
			warm: w,
			cold: c,
			cpuMedian: cpu,
			peakMemoryMiBMedian: rss,
			replicaMedians: all.map((a) => median(a.warm.map((s) => s.wallMs / 1000))),
			files: reference.files,
			errors: reference.errors,
			errorsByCode: reference.errorsByCode,
			failures: reference.failures,
			digests,
			broken: broken.map((b) => ({
				phase: b.phase,
				round: b.round,
				problem: b.problem,
				stderr: b.stderr.slice(-1500),
			})),
		};
		const failures =
			reference.failures && Object.keys(reference.failures).length
				? ` (${JSON.stringify(reference.failures)})`
				: '';
		const problem = broken.length ? `${broken.length}: ${broken[0]!.problem.slice(0, 160)}` : '';
		const spread = digests.length > 1 ? ' ⚠ diagnostics differ between jobs' : '';
		md.push(
			`| ${reference.label} | **${f(w.median)}** | ${f(w.ci95[0])}–${f(w.ci95[1])} | ${f(w.cv * 100, 1)}% | ${f(cpu)} | ${f(rss, 0)} | ${f(c.median)} | ${reference.files ?? '–'} | ${reference.errors ?? '–'}${failures} | ${codes(reference.errorsByCode)} | ${problem}${spread} |`,
		);
	}
	md.push(
		'\nCPU and memory cover every process of the run, sampled every 20 ms; memory is the peak of their summed RSS.\n',
	);
	md.push('| comparison | speedup | 95% CI | per job | rounds |');
	md.push('|---|---:|---|---|---:|');
	for (const [base, candidate, label] of PAIRS) {
		const ratios: number[] = [];
		const perJob: number[] = [];
		for (const job of replicas) {
			const b = new Map((job.arms[base]?.warm ?? []).map((s) => [s.round, s.wallMs]));
			const own: number[] = [];
			for (const s of job.arms[candidate]?.warm ?? []) {
				const baseline = b.get(s.round);
				if (baseline !== undefined) own.push(baseline / s.wallMs);
			}
			ratios.push(...own);
			if (own.length) perJob.push(median(own));
		}
		if (!ratios.length) {
			md.push(`| ${label} | UNMEASURED | | | 0 |`);
			continue;
		}
		const d = describe(ratios);
		project.speedups[`${base}->${candidate}`] = { label, ...d, perJob };
		md.push(
			`| ${label} | **${f(d.median)}×** | ${f(d.ci95[0])}–${f(d.ci95[1])}× | ${perJob.map((x) => f(x)).join(', ')} | ${d.n} |`,
		);
	}
	const a = project.arms;
	const head = project.speedups['svelte-check-tsgo->rsvelte-tsrs'];
	const why = a['svelte-check-tsgo']?.broken[0]?.problem.slice(0, 120);
	headline.push(
		`| ${id} | ${env.programComponents} | ${a['svelte-check-ts6'] ? f(a['svelte-check-ts6'].warm.median) : '–'} | ${!a['svelte-check-tsgo'] ? '–' : a['svelte-check-tsgo'].warm.n ? f(a['svelte-check-tsgo'].warm.median) : `✗ ${why ?? ''}`} | ${a['rsvelte-tsgo'] ? f(a['rsvelte-tsgo'].warm.median) : '–'} | ${a['rsvelte-tsrs'] ? f(a['rsvelte-tsrs'].warm.median) : '–'} | ${head ? `**${f(head.median)}×** (${f(head.ci95[0])}–${f(head.ci95[1])})` : '–'} | ${['svelte-check-ts6', 'svelte-check-tsgo', 'rsvelte-tsgo', 'rsvelte-tsrs'].map((arm) => a[arm]?.errors ?? '–').join(' / ')} |`,
	);

	const controls = replicas.map((job) => job.control).filter((c) => !!c);
	if (controls.length) {
		const failing = controls.flatMap((c, i) =>
			Object.entries(c.arms)
				.filter(([, r]) => !r.ok)
				.map(([arm, r]) => `job ${i + 1} ${arm}: ${JSON.stringify(r)}`),
		);
		project.positiveControl = controls;
		md.push(
			`\n**Positive control** (${controls[0]!.expectedFiles} injected TS2322, one per file, ${controls.length} job(s)): ${failing.length ? 'FAILED ' + failing.join('; ') : 'every arm reported exactly the injected errors in every job'}`,
		);
	}
	const agreement = replicas[0]!.agreement;
	project.agreement = agreement;
	const lines = Object.entries(agreement).map(
		([pair, x]) =>
			`- ${pair}: both ${x.both}, only left ${x.onlyLeft} (${codes(x.onlyLeftByCode)}), only right ${x.onlyRight} (${codes(x.onlyRightByCode)})`,
	);
	if (lines.length)
		md.push(
			'\n<details><summary>TypeScript errors by position and code</summary>\n',
			...lines,
			'\n</details>\n',
		);
	summary[id] = project;
}

if (headline.length) {
	const at = md.findIndex((line) => line.startsWith('## '));
	md.splice(
		at,
		0,
		'## Headline (warm median, seconds)\n',
		'| project | components | svelte-check TS 6 | svelte-check TS 7.1 (tsgo) | rsvelte + tsgo | rsvelte + tsrs | official TS 7.1 → rsvelte + tsrs | TS errors (ts6 / tsgo / rsvelte tsgo / rsvelte tsrs) |',
		'|---|---:|---:|---:|---:|---:|---:|---|',
		...headline,
		'',
	);
}
fs.writeFileSync(markdownFile, md.join('\n') + '\n');
fs.writeFileSync(
	jsonFile,
	JSON.stringify({ generated: new Date().toISOString(), projects: summary }, null, '\t') + '\n',
);
process.stdout.write(md.join('\n') + '\n');
