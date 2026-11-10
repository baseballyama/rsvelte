// `report.ts <report.md> <results directory>…`: compares the arms from what `measure.ts` wrote.
// A results directory holds one platform's files, one instruction part's or both. A ratio is
// experimental over main, so below 1 means experimental is faster or smaller.
import fs from 'node:fs';
import path from 'node:path';

const [reportFile, ...directories] = process.argv.slice(2);
if (!reportFile || directories.length === 0)
	throw new Error('expected <report.md> <results directory>…');

const exists = (directory: string, name: string) => fs.existsSync(path.join(directory, name));
const text = (directory: string, name: string) =>
	fs.readFileSync(path.join(directory, name), 'utf8');
const rows = (directory: string, name: string) =>
	text(directory, name)
		.split('\n')
		.filter((line) => line !== '');
const jsonl = (directory: string, name: string) =>
	rows(directory, name).map((line) => JSON.parse(line));

const sorted = (values: number[]) => values.toSorted((a, b) => a - b);
const quantile = (values: number[], q: number) => {
	const s = sorted(values);
	if (s.length === 0) return NaN;
	const position = (s.length - 1) * q;
	const low = Math.floor(position);
	const high = Math.ceil(position);
	return s[low]! + (s[high]! - s[low]!) * (position - low);
};
const median = (values: number[]) => quantile(values, 0.5);
const ms = (ns: number) => (ns / 1e6).toFixed(1);
const ratio = (experimental: number, main: number) => (experimental / main).toFixed(3);
const mib = (bytes: number) => (bytes / 2 ** 20).toFixed(1);
const giga = (n: number) => (n / 1e9).toFixed(3);
const short = (file: string) => file.replace(/^.*\/files\//, '');
const table = (header: string[], body: (string | number)[][]) =>
	[
		`| ${header.join(' | ')} |`,
		`| ${header.map(() => '---').join(' | ')} |`,
		...body.map((row) => `| ${row.join(' | ')} |`),
	].join('\n');

const out: string[] = ['# Lint: main against experimental', ''];
out.push(
	'A ratio is experimental over main: below 1 means experimental is faster or smaller. Both arms',
	'are built from `tools/performance/workloads/lint-versus-main` with the same compiler, profile,',
	'harness and allocator, and lint the same files with the same rules, each with its default',
	'options. Mode `rules` runs the rules alone. Mode `product` adds what each tool runs on top: main',
	'compiles every component for the compiler’s warnings, and experimental runs',
	'`svelte/valid-compile`.',
	'',
);

const platforms = directories.filter((d) => exists(d, 'platform.json'));
const first = platforms[0];
if (first) {
	const p = JSON.parse(text(first, 'platform.json'));
	const universe = JSON.parse(text(first, 'universe.json'));
	const excludedFiles = rows(first, 'excluded.tsv');
	out.push(
		'## Work',
		'',
		`- main \`${p.main}\`, experimental \`${p.experimental}\`, Rust ${p.rust}.`,
		`- ${rows(first, 'inputs.txt').length} components linted; ${excludedFiles.length} left out because an arm fails on them; ${rows(first, 'sample.txt').length} in the sample the per-rule counts use.`,
		`- Mode \`rules\`: ${universe.rules} rules. Mode \`product\`: ${universe.product.main} in main, ${universe.product.experimental} in experimental.`,
		'',
	);
	if (excludedFiles.length > 0) {
		out.push('<details><summary>Components left out</summary>', '');
		out.push(
			table(
				['component', 'reason'],
				excludedFiles.map((row) => row.split('\t')),
			),
		);
		out.push('', '</details>', '');
	}
	out.push('<details><summary>Rules left out</summary>', '');
	out.push(
		table(
			['rule', 'reason'],
			universe.excluded.map((e: { rule: string; reason: string }) => [`\`${e.rule}\``, e.reason]),
		),
	);
	out.push('', '</details>', '');
}

for (const directory of platforms) {
	const p = JSON.parse(text(directory, 'platform.json'));
	out.push(`## ${p.label ?? p.os} (${p.arch}, ${p.cpu}, ${p.parallelism} threads)`, '');
	if (exists(directory, 'wall.jsonl')) {
		const records = jsonl(directory, 'wall.jsonl');
		const groups = new Map<string, Record<string, typeof records>>();
		for (const r of records) {
			const key = `${r.mode}\t${r.allocator}\t${r.threads}`;
			const group = groups.get(key) ?? {};
			(group[r.arm] ??= []).push(r);
			groups.set(key, group);
		}
		const body: (string | number)[][] = [];
		const memory: (string | number)[][] = [];
		for (const [key, group] of groups) {
			const [mode, allocator, threads] = key.split('\t');
			const main = group.main ?? [];
			const experimental = group.experimental ?? [];
			const best = (rs: typeof records) => rs.map((r) => Math.min(...r.round_ns.slice(1)));
			const cold = (rs: typeof records) => rs.map((r) => r.round_ns[0]);
			const [bm, be] = [best(main), best(experimental)];
			body.push([
				mode!,
				allocator!,
				threads!,
				`${ms(median(bm))} (${ms(Math.min(...bm))}–${ms(Math.max(...bm))})`,
				`${ms(median(be))} (${ms(Math.min(...be))}–${ms(Math.max(...be))})`,
				ratio(median(be), median(bm)),
				ratio(median(cold(experimental)), median(cold(main))),
				`${ms(median(main.map((r) => r.setup_ns)))} / ${ms(median(experimental.map((r) => r.setup_ns)))}`,
			]);
			if (threads === '1')
				memory.push([
					mode!,
					allocator!,
					`${mib(median(main.map((r) => r.peak_resident_bytes)))} / ${mib(median(experimental.map((r) => r.peak_resident_bytes)))}`,
					ratio(
						median(experimental.map((r) => r.peak_resident_bytes)),
						median(main.map((r) => r.peak_resident_bytes)),
					),
					`${main[0]?.allocations} / ${experimental[0]?.allocations}`,
					`${mib(main[0]?.allocated_bytes)} / ${mib(experimental[0]?.allocated_bytes)}`,
				]);
		}
		const repetitions = new Set(records.map((r) => r.repetition)).size;
		out.push(
			`Wall-clock time of one pass over every component, in ms: the median over ${repetitions} processes of each process's fastest warm round (fastest–slowest process in brackets). The cold round is each process's first.`,
			'',
			table(
				[
					'mode',
					'allocator',
					'threads',
					'main',
					'experimental',
					'ratio',
					'cold ratio',
					'set-up main / experimental',
				],
				body,
			),
			'',
			'Memory with one thread: the peak resident set of the process (the sources are read before the set-up, the same in both arms), and the allocations of one warm round.',
			'',
			table(
				[
					'mode',
					'allocator',
					'peak MiB main / experimental',
					'ratio',
					'allocations main / experimental',
					'allocated MiB main / experimental',
				],
				memory,
			),
			'',
		);
	}
	for (const mode of ['rules', 'product']) {
		const name = (arm: string) => `files-${mode}-${arm}.tsv`;
		if (!exists(directory, name('main')) || !exists(directory, name('experimental'))) continue;
		const time = (arm: string) =>
			new Map(
				rows(directory, name(arm)).map((row) => {
					const [file, ns] = row.split('\t');
					return [file!, Number(ns)];
				}),
			);
		const [main, experimental] = [time('main'), time('experimental')];
		const files = [...main.keys()].filter((file) => experimental.has(file));
		const ratios = files.map((file) => ({
			file,
			main: main.get(file)!,
			experimental: experimental.get(file)!,
			ratio: experimental.get(file)! / main.get(file)!,
			bytes: fs.existsSync(file) ? fs.statSync(file).size : NaN,
		}));
		const values = ratios.map((r) => r.ratio);
		const top = (list: typeof ratios) =>
			list.map((r) => [
				short(r.file),
				r.bytes,
				(r.main / 1e3).toFixed(0),
				(r.experimental / 1e3).toFixed(0),
				r.ratio.toFixed(2),
			]);
		const byRatio = ratios.toSorted((a, b) => b.ratio - a.ratio);
		out.push(
			`### Each component alone, mode \`${mode}\``,
			'',
			`The fastest of the rounds for each of ${files.length} components. Ratio quantiles: p1 ${quantile(values, 0.01).toFixed(2)}, p10 ${quantile(values, 0.1).toFixed(2)}, p50 ${median(values).toFixed(2)}, p90 ${quantile(values, 0.9).toFixed(2)}, p99 ${quantile(values, 0.99).toFixed(2)}, max ${Math.max(...values).toFixed(2)}. Sum: main ${ms(ratios.reduce((s, r) => s + r.main, 0))} ms, experimental ${ms(ratios.reduce((s, r) => s + r.experimental, 0))} ms.`,
			'',
			'<details><summary>Components with the highest and the lowest ratio</summary>',
			'',
			table(
				['component', 'bytes', 'main µs', 'experimental µs', 'ratio'],
				[...top(byRatio.slice(0, 15)), ...top(byRatio.slice(-15))],
			),
			'',
			'</details>',
			'',
		);
	}
}

const instructionFiles = directories.flatMap((d) =>
	fs.existsSync(d)
		? fs
				.readdirSync(d)
				.filter((n) => /^instructions-.*\.jsonl$/.test(n))
				.map((n) => [d, n] as const)
		: [],
);
const instructionRecords = instructionFiles.flatMap(([d, n]) => jsonl(d, n));
const whole = instructionRecords.filter((r) => r.scope === 'whole');
if (whole.length > 0) {
	out.push('## Instructions (Valgrind, x86_64 Linux, system allocator)', '');
	out.push(
		'One round over every component, less the same process with no round, in billions of instructions.',
		'',
	);
	const body = ['rules', 'product'].map((mode) => {
		const m = whole.find((r) => r.mode === mode && r.arm === 'main');
		const e = whole.find((r) => r.mode === mode && r.arm === 'experimental');
		return [
			mode,
			m ? giga(m.round) : '-',
			e ? giga(e.round) : '-',
			m && e ? ratio(e.round, m.round) : '-',
			m && e ? `${giga(m.setup)} / ${giga(e.setup)}` : '-',
		];
	});
	out.push(
		table(
			['mode', 'main', 'experimental', 'ratio', 'process without a round main / experimental'],
			body,
		),
		'',
	);
}
const perRule = instructionRecords.filter((r) => r.scope === 'rule');
if (perRule.length > 0) {
	const baseline = (arm: string) =>
		perRule.find((r) => r.rule === null && r.arm === arm)?.round ?? NaN;
	const [bm, be] = [baseline('main'), baseline('experimental')];
	const rules = [...new Set(perRule.filter((r) => r.rule !== null).map((r) => r.rule as string))];
	const body = rules
		.map((rule) => {
			const m = perRule.find((r) => r.rule === rule && r.arm === 'main')!;
			const e = perRule.find((r) => r.rule === rule && r.arm === 'experimental')!;
			return { rule, m: m.round, e: e.round, mr: m.round - bm, er: e.round - be };
		})
		.toSorted((a, b) => b.e - b.m - (a.e - a.m));
	out.push(
		'## Each rule alone (Valgrind, the sample)',
		'',
		`One round over the ${perRule[0].documents} components of the sample with one rule, in millions of instructions, slowest experimental against main first. The baseline is the same round with no rule: main ${(bm / 1e6).toFixed(1)}, experimental ${(be / 1e6).toFixed(1)}. Main parses every component even with no rule; experimental computes only what a rule asks for.`,
		'',
		table(
			[
				'rule',
				'main',
				'experimental',
				'ratio',
				'main above baseline',
				'experimental above baseline',
			],
			body.map((r) => [
				`\`${r.rule}\``,
				(r.m / 1e6).toFixed(1),
				(r.e / 1e6).toFixed(1),
				ratio(r.e, r.m),
				(r.mr / 1e6).toFixed(1),
				(r.er / 1e6).toFixed(1),
			]),
		),
		'',
	);
}

if (first) {
	for (const mode of ['rules', 'product']) {
		const counts = (arm: string) =>
			exists(first, `findings-${mode}-${arm}.tsv`)
				? new Map(
						rows(first, `findings-${mode}-${arm}.tsv`).map((row) => {
							const [code, n] = row.split('\t');
							return [code!, Number(n)];
						}),
					)
				: undefined;
		const [main, experimental] = [counts('main'), counts('experimental')];
		if (!main || !experimental) continue;
		const codes = [...new Set([...main.keys(), ...experimental.keys()])].toSorted();
		const differ = codes.filter((code) => main.get(code) !== experimental.get(code));
		out.push(
			`## Findings, mode \`${mode}\``,
			'',
			`${codes.length} codes; ${differ.length} have different counts. Speed is compared on the same rules, not on the same findings.`,
			'',
			'<details><summary>Findings of each code</summary>',
			'',
			table(
				['code', 'main', 'experimental'],
				codes.map((code) => [`\`${code}\``, main.get(code) ?? 0, experimental.get(code) ?? 0]),
			),
			'',
			'</details>',
			'',
		);
	}
}

fs.writeFileSync(reportFile, out.join('\n') + '\n');
