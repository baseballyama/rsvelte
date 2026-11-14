// `measure.ts --id <name> --project <dir> --tsconfig <relative> --language-tools <dir>
//   --tools <dir> --rsvelte <binary> --mapper <binary> --out <file.json> [--rounds 10]
//   [--warmup 2] [--cold 3] [--seed 1] [--expect-synthetic <components>] [--arms a,b]`
// times every arm (`ARMS`) on one project and writes every sample and diagnostic to `--out`.
//
// Each round runs every arm once, in an order shuffled with `--seed`, so drift on the runner lands
// on all arms alike and two arms can be paired by round. `--warmup` rounds are not recorded.
// `--cold` rounds drop the page cache before each run. A run that does not finish, or whose
// diagnostics differ from its arm's first run, is recorded as broken and never averaged.
// `--expect-synthetic` asserts that every arm reports exactly the injected errors.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type Diagnostic, type Parsed, parsers, TASK } from './parse.ts';
import { expectedErrors } from './synthetic.ts';

const MAPPER_PACKAGE = '@sveltejs/ts-content-mapper';
const NATIVE_ALIAS = '@typescript/native';
const BENCH_TSCONFIG = 'tsconfig.bench-ts7.json';

const ARMS = [
	'svelte-check-ts6',
	'svelte-check-tsgo',
	'svelte-check-tsrs',
	'rsvelte-tsgo',
	'rsvelte-tsrs',
	'rsvelte-tsrs-fast',
] as const;
type ArmName = (typeof ARMS)[number];

const args = process.argv.slice(2);
const options: Record<string, string> = {};
for (let i = 0; i < args.length; i += 2) {
	const key = args[i]!;
	if (!key.startsWith('--') || args[i + 1] === undefined) throw new Error(`bad option ${key}`);
	options[key.slice(2)] = args[i + 1]!;
}
const option = (name: string): string => {
	const value = options[name];
	if (value === undefined) throw new Error(`--${name} is required`);
	return value;
};
const number = (name: string, fallback: number) => Number(options[name] ?? fallback);
const rounds = number('rounds', 10);
const warmup = number('warmup', 2);
const coldRounds = number('cold', 3);
const seed = number('seed', 1);
const expectSynthetic = options['expect-synthetic'] ? Number(options['expect-synthetic']) : null;
const workspace = fs.realpathSync(option('project'));
const tsconfig = path.join(workspace, option('tsconfig'));
const languageTools = path.resolve(option('language-tools'));
const tools = path.resolve(option('tools'), 'node_modules');
const rsvelte = path.resolve(option('rsvelte'));
const mapper = path.resolve(option('mapper'));
const out = path.resolve(option('out'));
const selected = (options.arms ?? ARMS.join(',')).split(',').filter(Boolean) as ArmName[];
for (const arm of selected) if (!ARMS.includes(arm)) throw new Error(`unknown arm ${arm}`);

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const versionOf = (directory: string): string =>
	readJson(path.join(directory, 'package.json')).version;
const sha256 = (file: string) =>
	crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const output = (program: string, argv: string[], cwd = workspace) => {
	const result = spawnSync(program, argv, { cwd, encoding: 'utf8', maxBuffer: 1 << 30 });
	return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
};

/** The package `name` resolves to from `from`, as Node walks up `node_modules`. */
function resolvePackage(name: string, from: string): string | null {
	for (let directory = from; ; directory = path.dirname(directory)) {
		const candidate = path.join(directory, 'node_modules', name);
		if (fs.existsSync(path.join(candidate, 'package.json'))) return fs.realpathSync(candidate);
		if (path.dirname(directory) === directory) return null;
	}
}

function link(target: string, at: string): void {
	fs.mkdirSync(path.dirname(at), { recursive: true });
	fs.rmSync(at, { recursive: true, force: true });
	fs.symlinkSync(target, at, 'dir');
}

const platform = `${process.platform}-${process.arch}`;
const svelteCheckPublished = path.join(tools, 'svelte-check');
const ts6 = path.join(tools, 'typescript');
const ts7 = path.join(tools, 'ts7');
const ts7Native = path.join(tools, `@typescript/typescript-${platform}/lib/tsc`);
const tsrs = path.join(tools, 'tsrs');
const tsrsNative = path.join(
	tools,
	`@tsrs/${process.platform === 'linux' ? `${platform}-gnu` : platform}/tsrs`,
);
const languageToolsCli = path.join(languageTools, 'packages/svelte-check/dist/src/index.js');
const mapperDirectory = path.join(languageTools, 'packages/typescript-content-mapper');
for (const file of [
	ts7Native,
	tsrsNative,
	languageToolsCli,
	path.join(mapperDirectory, 'dist/server.js'),
	path.join(svelteCheckPublished, 'bin/svelte-check'),
	rsvelte,
	mapper,
])
	if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
if (!fs.existsSync(tsconfig)) throw new Error(`no tsconfig at ${tsconfig}`);
const svelte = resolvePackage('svelte', path.dirname(tsconfig));
if (!svelte) throw new Error('the project has no svelte package');

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'check-versus-svelte-check-'));
// svelte-check requires TypeScript 7.1 by the version in package.json and loads its `async` and
// `ast` modules; tsrs ships the same API under its own name and version, and starts tsrs.
const tsrsAsNative = path.join(scratch, 'tsrs-as-typescript-native');
fs.mkdirSync(tsrsAsNative);
fs.writeFileSync(
	path.join(tsrsAsNative, 'package.json'),
	JSON.stringify({
		name: NATIVE_ALIAS,
		version: /^Version (\S+)/.exec(output(tsrsNative, ['--version']).stdout)?.[1],
		type: 'module',
		exports: { './package.json': './package.json', './async': './async.js', './ast': './ast.js' },
	}),
);
for (const [name, subpath] of [
	['async.js', 'dist/api/async/api.js'],
	['ast.js', 'dist/ast/index.js'],
] as const)
	fs.writeFileSync(
		path.join(tsrsAsNative, name),
		`export * from ${JSON.stringify(new URL(`file://${path.join(tsrs, subpath)}`).href)};\n`,
	);

const nodeModules = path.join(workspace, 'node_modules');
link(mapperDirectory, path.join(nodeModules, MAPPER_PACKAGE));
const nativeLink = path.join(nodeModules, NATIVE_ALIAS);
const benchTsconfig = path.join(path.dirname(tsconfig), BENCH_TSCONFIG);
fs.writeFileSync(
	benchTsconfig,
	JSON.stringify(
		{
			extends: './' + path.basename(tsconfig),
			contentMappers: [{ package: MAPPER_PACKAGE, extensions: ['.svelte'] }],
		},
		null,
		'\t',
	) + '\n',
);

/**
 * The program TypeScript 7.1 builds from the tsconfig with the official content mapper, which
 * svelte-check reports on. The report describes it; rsvelte finds its own files.
 */
function programFiles(): string[] {
	link(ts7, nativeLink);
	const listed = output(ts7Native, ['-p', benchTsconfig, '--listFilesOnly', '--runExternalCode']);
	const files = listed.stdout
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => path.isAbsolute(line) && fs.existsSync(line))
		.filter((file) => file.endsWith('.svelte') || !/[\\/]node_modules[\\/]/.test(file))
		.filter(
			(file) => !/[\\/]svelte2tsx[\\/]svelte-(shims|jsx|native-jsx)(-v4)?\.d\.ts$/.test(file),
		);
	if (!files.some((file) => file.endsWith('.svelte')))
		throw new Error(
			`tsc --listFilesOnly listed no component (exit ${listed.status}):\n${listed.stderr}${listed.stdout.slice(-4000)}`,
		);
	return [...new Set(files)].toSorted();
}

// `rsvelte check` asks the checker for the tsconfig's files, and its mapper projects any other
// component the program reads, such as a package's.
const rsvelteArguments = (checker: string) => [
	'check',
	'--task',
	TASK,
	'--options',
	'typescript.check',
	JSON.stringify({ command: [checker], tsconfig }),
	'--options',
	'svelte.check',
	JSON.stringify({ svelte, contentMapper: mapper }),
];

/** The files `rsvelte check` checks, from the header of each output. */
function rsvelteFiles(): string[] {
	const run = output(rsvelte, rsvelteArguments(ts7Native));
	const files = [...run.stdout.matchAll(/^\/\/ (.+) ts\.check\/default \w+$/gm)].map(
		([, file]) => file!,
	);
	if (files.length === 0)
		throw new Error(`rsvelte check found no file (exit ${run.status}):\n${run.stderr}`);
	return [...new Set(files)].toSorted();
}
const program = programFiles();
const files = rsvelteFiles();

const { parseRsvelte, parseSvelteCheck, relative } = parsers(workspace);

type Arm = {
	label: string;
	program: string;
	arguments: string[];
	env?: Record<string, string>;
	native?: string;
	typescript: string;
	parse: (stdout: string) => Parsed;
};
const svelteCheck = ['--workspace', workspace, '--output', 'machine-verbose'];
// Type checking only: rsvelte's check runs no Svelte compiler or CSS diagnostics either.
const sources = ['--diagnostic-sources', 'js'];
const rsvelteArm = (checker: string, typescript: string, env?: Record<string, string>): Arm => ({
	label: '',
	program: rsvelte,
	arguments: rsvelteArguments(checker),
	env,
	typescript,
	parse: parseRsvelte,
});
const nativeVersion = (binary: string) => output(binary, ['--version']).stdout.trim();
const arms: Record<ArmName, Arm> = {
	'svelte-check-ts6': {
		label: `svelte-check ${versionOf(svelteCheckPublished)}, TypeScript ${versionOf(ts6)}`,
		program: process.execPath,
		arguments: [
			path.join(svelteCheckPublished, 'bin/svelte-check'),
			...svelteCheck,
			'--tsconfig',
			tsconfig,
			...sources,
		],
		typescript: versionOf(ts6),
		parse: parseSvelteCheck,
	},
	'svelte-check-tsgo': {
		label: 'svelte-check --experimental-ts7, svelte2tsx content mapper, tsgo',
		program: process.execPath,
		arguments: [
			languageToolsCli,
			...svelteCheck,
			'--tsconfig',
			benchTsconfig,
			'--experimental-ts7',
			...sources,
		],
		native: ts7,
		typescript: nativeVersion(ts7Native),
		parse: parseSvelteCheck,
	},
	'svelte-check-tsrs': {
		label: 'svelte-check --experimental-ts7, svelte2tsx content mapper, tsrs',
		program: process.execPath,
		arguments: [
			languageToolsCli,
			...svelteCheck,
			'--tsconfig',
			benchTsconfig,
			'--experimental-ts7',
			...sources,
		],
		native: tsrsAsNative,
		typescript: nativeVersion(tsrsNative),
		parse: parseSvelteCheck,
	},
	'rsvelte-tsgo': {
		...rsvelteArm(ts7Native, nativeVersion(ts7Native)),
		label: 'rsvelte, Rust content mapper, tsgo',
	},
	'rsvelte-tsrs': {
		...rsvelteArm(tsrsNative, nativeVersion(tsrsNative)),
		label: 'rsvelte, Rust content mapper, tsrs',
	},
	'rsvelte-tsrs-fast': {
		...rsvelteArm(tsrsNative, nativeVersion(tsrsNative), { TSRS_FAST: '1' }),
		label: 'rsvelte, Rust content mapper, tsrs TSRS_FAST=1',
	},
};

const env = {
	id: option('id'),
	date: new Date().toISOString(),
	platform,
	runnerImage: process.env.ImageOS ? `${process.env.ImageOS} ${process.env.ImageVersion}` : null,
	cpu: os.cpus()[0]?.model ?? null,
	cpus: os.availableParallelism(),
	memoryGiB: Number((os.totalmem() / 2 ** 30).toFixed(1)),
	node: process.version,
	rsvelteRevision: process.env.RSVELTE_REVISION ?? null,
	rsvelteSha256: sha256(rsvelte),
	mapperSha256: sha256(mapper),
	languageToolsRevision: output('git', ['-C', languageTools, 'rev-parse', 'HEAD']).stdout.trim(),
	svelteCheckTs7Sha256: sha256(languageToolsCli),
	officialMapperSha256: sha256(path.join(mapperDirectory, 'dist/server.js')),
	svelteCheck: versionOf(svelteCheckPublished),
	typescript6: versionOf(ts6),
	tsgo: nativeVersion(ts7Native),
	tsrs: nativeVersion(tsrsNative),
	projectRevision: output('git', ['rev-parse', 'HEAD']).stdout.trim() || null,
	projectTypescript: (() => {
		const own = resolvePackage('typescript', path.dirname(tsconfig));
		return own && versionOf(own);
	})(),
	projectSvelte: versionOf(svelte),
	svelteFilesOnDisk: output('sh', [
		'-c',
		"find . -name '*.svelte' -not -path '*/node_modules/*' -not -path './.svelte-kit/*' | wc -l",
	]).stdout.trim(),
	programFiles: files.length,
	programComponents: program.filter((file) => file.endsWith('.svelte')).length,
	programComponentsInNodeModules: program.filter((file) => /[\\/]node_modules[\\/]/.test(file))
		.length,
	tsconfig: path.relative(workspace, tsconfig),
	protocol: { rounds, warmup, cold: coldRounds, seed },
};
process.stdout.write(JSON.stringify(env, null, 2) + '\n');

type Sample = {
	phase: string;
	round: number;
	load1: number;
	wallMs: number;
	userMs: number;
	sysMs: number;
	maxRssKiB: number;
	treeCpuMs: number;
	treePeakRssKiB: number;
	treePids: number;
	status: number;
	digest: string;
};
type Result = {
	warm: Sample[];
	cold: Sample[];
	broken: (Sample & { problem: string; stderr: string; stdout: string })[];
	reference: (Parsed & { digest: string }) | null;
};
const results = Object.fromEntries(
	selected.map((arm) => [arm, { warm: [], cold: [], broken: [], reference: null } as Result]),
) as Record<ArmName, Result>;

const key = (d: Diagnostic) => `${d.file}:${d.line}:${d.column} TS${d.code}`;
const digest = (diagnostics: Diagnostic[]) =>
	crypto
		.createHash('sha256')
		.update(diagnostics.map(key).toSorted().join('\n'))
		.digest('hex')
		.slice(0, 16);

function runOnce(name: ArmName, phase: string, round: number): void {
	const arm = arms[name];
	if (arm.native) link(arm.native, nativeLink);
	const usageFile = path.join(scratch, 'usage.json');
	fs.rmSync(usageFile, { force: true });
	const childEnv: Record<string, string | undefined> = { ...process.env, ...arm.env };
	if (!arm.env?.TSRS_FAST) delete childEnv.TSRS_FAST;
	const load1 = os.loadavg()[0]!;
	const run = spawnSync(
		process.env.BENCH_PYTHON ?? 'python3',
		[
			'-I',
			path.join(import.meta.dirname, 'tree-usage.py'),
			usageFile,
			'--',
			arm.program,
			...arm.arguments,
		],
		{ cwd: workspace, encoding: 'utf8', maxBuffer: 1 << 30, env: childEnv },
	);
	const usage = readJson(usageFile);
	const parsed = arm.parse(run.stdout);
	const sample: Sample = { phase, round, load1, ...usage, digest: digest(parsed.diagnostics) };
	const result = results[name];
	const problem =
		parsed.problem ?? (usage.status === 0 || usage.status === 1 ? null : `exit ${usage.status}`);
	if (problem) {
		result.broken.push({
			...sample,
			problem,
			stderr: run.stderr.slice(-4000),
			stdout: run.stdout.slice(-2000),
		});
		process.stdout.write(`  ${name.padEnd(18)} ${phase} r${round}  BROKEN: ${problem}\n`);
		process.stdout.write(run.stderr.slice(-2000) + '\n');
		return;
	}
	if (!result.reference) result.reference = { ...parsed, digest: sample.digest };
	else if (result.reference.digest !== sample.digest) {
		result.broken.push({
			...sample,
			problem: `diagnostics changed (${result.reference.digest} -> ${sample.digest})`,
			stderr: '',
			stdout: '',
		});
		process.stdout.write(`  ${name.padEnd(18)} ${phase} r${round}  NONDETERMINISTIC\n`);
		return;
	}
	if (phase === 'warm') result.warm.push(sample);
	if (phase === 'cold') result.cold.push(sample);
	process.stdout.write(
		`  ${name.padEnd(18)} ${phase.padEnd(6)} r${String(round).padStart(2)} ` +
			`${(usage.wallMs / 1000).toFixed(3).padStart(8)}s  cpu ${(usage.treeCpuMs / 1000).toFixed(2)}s ` +
			`rss ${(usage.treePeakRssKiB / 1024).toFixed(0)}MiB (${usage.treePids} pids)  ` +
			`${parsed.files} files ${parsed.diagnostics.length} errors  load ${load1.toFixed(2)}\n`,
	);
}

function mulberry32(state: number): () => number {
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const random = mulberry32(seed);
function shuffled<T>(list: T[]): T[] {
	const copy = [...list];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[copy[i], copy[j]] = [copy[j]!, copy[i]!];
	}
	return copy;
}
const dropCaches = () =>
	output('sudo', ['sh', '-c', 'sync && echo 3 > /proc/sys/vm/drop_caches']).status === 0;

const live = () => selected.filter((arm) => results[arm].broken.length === 0);
const order: ArmName[][] = [];
for (let r = 0; r < warmup; r++) for (const arm of shuffled(live())) runOnce(arm, 'warmup', r);
for (let r = 0; r < rounds; r++) {
	const sequence = shuffled(live());
	order.push(sequence);
	for (const arm of sequence) runOnce(arm, 'warm', r);
}
let coldAvailable = coldRounds > 0 && process.platform === 'linux' && dropCaches();
for (let r = 0; coldAvailable && r < coldRounds; r++)
	for (const arm of shuffled(live())) {
		if (!dropCaches()) {
			coldAvailable = false;
			break;
		}
		runOnce(arm, 'cold', r);
	}

let control: null | { expectedFiles: number; arms: Record<string, unknown> } = null;
if (expectSynthetic) {
	const expected = expectedErrors(expectSynthetic).toSorted();
	control = { expectedFiles: expected.length, arms: {} };
	for (const arm of selected) {
		const reference = results[arm].reference;
		if (!reference) {
			control.arms[arm] = { ok: false, reason: 'no successful run' };
			continue;
		}
		const found = reference.diagnostics;
		const errorFiles = [...new Set(found.map((d) => d.file))].toSorted();
		const codes = [...new Set(found.map((d) => d.code))];
		const ok =
			JSON.stringify(errorFiles) === JSON.stringify(expected) &&
			found.length === expected.length &&
			codes.join() === '2322';
		control.arms[arm] = { ok, errors: found.length, files: errorFiles.length, codes };
	}
}

const PAIRS: [ArmName, ArmName][] = [
	['svelte-check-tsgo', 'rsvelte-tsgo'],
	['rsvelte-tsgo', 'rsvelte-tsrs'],
	['rsvelte-tsrs', 'rsvelte-tsrs-fast'],
	['svelte-check-tsgo', 'svelte-check-tsrs'],
	['svelte-check-tsgo', 'rsvelte-tsrs'],
	['svelte-check-ts6', 'svelte-check-tsgo'],
	['svelte-check-ts6', 'rsvelte-tsrs'],
];
const byCode = (list: Diagnostic[]) => {
	const counts: Record<string, number> = {};
	for (const d of list) counts[`TS${d.code}`] = (counts[`TS${d.code}`] ?? 0) + 1;
	return Object.fromEntries(Object.entries(counts).toSorted((a, b) => b[1] - a[1]));
};
const agreement: Record<string, unknown> = {};
for (const [left, right] of PAIRS) {
	const a = results[left]?.reference;
	const b = results[right]?.reference;
	if (!a || !b) continue;
	const inB = new Set(b.diagnostics.map(key));
	const inA = new Set(a.diagnostics.map(key));
	const onlyLeft = a.diagnostics.filter((d) => !inB.has(key(d)));
	const onlyRight = b.diagnostics.filter((d) => !inA.has(key(d)));
	agreement[`${left} vs ${right}`] = {
		left: a.diagnostics.length,
		right: b.diagnostics.length,
		both: a.diagnostics.length - onlyLeft.length,
		onlyLeft: onlyLeft.length,
		onlyRight: onlyRight.length,
		onlyLeftByCode: byCode(onlyLeft),
		onlyRightByCode: byCode(onlyRight),
		onlyLeftSample: onlyLeft.slice(0, 40),
		onlyRightSample: onlyRight.slice(0, 40),
	};
}

const report = {
	env,
	order,
	coldAvailable,
	control,
	agreement,
	files: files.map(relative),
	arms: Object.fromEntries(
		selected.map((name) => {
			const arm = arms[name];
			const result = results[name];
			return [
				name,
				{
					label: arm.label,
					typescript: arm.typescript,
					command: [path.basename(arm.program), ...arm.arguments.slice(0, 3)]
						.join(' ')
						.replaceAll(workspace, '<project>'),
					files: result.reference?.files ?? null,
					errors: result.reference?.diagnostics.length ?? null,
					errorsByCode: result.reference ? byCode(result.reference.diagnostics) : null,
					failures: result.reference?.failures ?? null,
					digest: result.reference?.digest ?? null,
					diagnostics: result.reference?.diagnostics ?? null,
					warm: result.warm,
					cold: result.cold,
					broken: result.broken,
				},
			];
		}),
	),
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(report, null, '\t') + '\n');
fs.rmSync(benchTsconfig, { force: true });
process.stdout.write(`\nwrote ${out}\n`);
if (control) {
	process.stdout.write(`positive control: ${JSON.stringify(control.arms)}\n`);
	if (Object.values(control.arms).some((arm) => !(arm as { ok: boolean }).ok)) process.exitCode = 3;
}
