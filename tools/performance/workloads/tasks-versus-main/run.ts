// `run.ts --main <main checkout> --work <directory> [--steps <list>] [--every 8] [--threads 1,N]
// [--repetitions 2] [--rounds 3] [--check-project synthetic-1000] [--check-rounds 3]` runs every
// comparison in one go and writes `<work>/results/report.md`. The README says what it needs.
//
// Steps, in order: `build` the arms, `stage` the corpus and its sample, time `tasks` (parse,
// client, server, format), `lint` and `check`, then write the `report`. A later run can pass
// `--steps` to repeat some of them on the same work directory.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { revision } from '../revision.ts';

const root = path.resolve(import.meta.dirname, '../../../..');
const here = 'tools/performance/workloads';
const args = process.argv.slice(2);
const options: Record<string, string> = {};
for (let i = 0; i < args.length; i += 2) {
	const key = args[i]!;
	if (!key.startsWith('--') || args[i + 1] === undefined) throw new Error(`bad option ${key}`);
	options[key.slice(2)] = args[i + 1]!;
}
const option = (name: string, fallback?: string): string => {
	const value = options[name] ?? fallback;
	if (value === undefined) throw new Error(`--${name} is required`);
	return value;
};
const STEPS = ['build', 'stage', 'tasks', 'lint', 'check', 'report'];
const steps = option('steps', STEPS.join(',')).split(',');
for (const step of steps) if (!STEPS.includes(step)) throw new Error(`unknown step ${step}`);
const main = path.resolve(option('main'));
const work = path.resolve(option('work'));
const every = Number(option('every', '8'));
const threads = option('threads', `1,${os.availableParallelism()}`);
const repetitions = option('repetitions', '2');
const rounds = option('rounds', '3');
const checkProject = option('check-project', 'synthetic-1000');
const checkRounds = option('check-rounds', '3');

const at = (...parts: string[]) => path.join(work, ...parts);
const results = at('results');
const bin = at('bin');
fs.mkdirSync(results, { recursive: true });

function run(program: string, argv: string[], cwd = root, env: Record<string, string> = {}) {
	process.stdout.write(`\n$ ${[program, ...argv].join(' ')}\n`);
	const result = spawnSync(program, argv, {
		cwd,
		stdio: 'inherit',
		env: { ...process.env, ...env },
	});
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`${program} exited ${result.status ?? result.signal}`);
}
const node = (script: string, argv: string[], env: Record<string, string> = {}) =>
	run(process.execPath, [path.join(root, here, script), ...argv], root, env);
const lintMeasure = (argv: string[]) => node('lint-versus-main/measure.ts', argv);

// The pins of the type check's tools, from the workflow that runs it in CI.
function checkPins(): Record<string, string> {
	const workflow = fs.readFileSync(
		path.join(root, '.github/workflows/check-versus-svelte-check.yml'),
		'utf8',
	);
	const pins: Record<string, string> = {};
	for (const name of [
		'LANGUAGE_TOOLS_SHA',
		'LANGUAGE_TOOLS_PNPM',
		'SVELTE_CHECK_VERSION',
		'TS6_VERSION',
		'TS7_VERSION',
		'TSRS_VERSION',
		'PSUTIL_VERSION',
	]) {
		const value = new RegExp(`^  ${name}: (\\S+)$`, 'm').exec(workflow)?.[1];
		if (!value) throw new Error(`the workflow pins no ${name}`);
		pins[name] = value;
	}
	return pins;
}

const durations: Record<string, number> = {};
function timed(name: string, body: () => void) {
	if (!steps.includes(name)) return;
	const started = performance.now();
	body();
	durations[name] = Math.round((performance.now() - started) / 1000);
	process.stdout.write(`\n== ${name}: ${durations[name]} s\n`);
}

timed('build', () => {
	const arms = at('arms');
	node('lint-versus-main/arms.ts', [main, arms]);
	node('tasks-versus-main/arms.ts', [main, arms]);
	fs.mkdirSync(bin, { recursive: true });
	// One target directory per tree, so the arms of a tree share their dependencies.
	for (const [arm, tree] of [
		['lint-main', 'main'],
		['lint-experimental', 'experimental'],
		['tasks-main', 'main'],
		['tasks-experimental', 'experimental'],
	] as const) {
		const target = at(`target-${tree}`);
		run('cargo', [
			'build',
			'--release',
			'--manifest-path',
			path.join(arms, arm, 'Cargo.toml'),
			'--target-dir',
			target,
		]);
		fs.copyFileSync(path.join(target, 'release', `${arm}-arm`), path.join(bin, `${arm}-arm`));
	}
	const experimentalTarget = at('target-experimental-workspace');
	run('cargo', [
		'build',
		'--release',
		'--target-dir',
		experimentalTarget,
		'-p',
		'rsvelte_command_line',
		'-p',
		'rsvelte_svelte_typescript_projection',
		'--bin',
		'rsvelte-dev',
		'--bin',
		'rsvelte-svelte-content-mapper',
	]);
	for (const name of ['rsvelte-dev', 'rsvelte-svelte-content-mapper'])
		fs.copyFileSync(path.join(experimentalTarget, 'release', name), path.join(bin, name));
	const mainTarget = at('target-main-workspace');
	run(
		'cargo',
		[
			'build',
			'--release',
			'--target-dir',
			mainTarget,
			'-p',
			'rsvelte_check',
			'--bin',
			'svelte_check',
		],
		main,
	);
	fs.copyFileSync(path.join(mainTarget, 'release', 'svelte_check'), path.join(bin, 'svelte_check'));
});

timed('stage', () => {
	node('lint-versus-main/stage.ts', [at('stage')]);
	// Components from real projects only, and every N-th of them, so the official tools stay short.
	const all = fs.readFileSync(at('stage', 'inputs.txt'), 'utf8').split('\n').filter(Boolean);
	// The staged projects named `rsvelte…` hold this repository's own tests.
	const files = path.join(at('stage'), 'files') + path.sep;
	const real = all.filter((file) => !file.startsWith(files + 'rsvelte'));
	const sample = real.filter((_, index) => index % every === 0);
	fs.writeFileSync(at('sample.txt'), sample.join('\n') + '\n');
	process.stdout.write(
		`sample: ${sample.length} of ${real.length} components from real projects\n`,
	);
});

const revisions = () => ({ main: revision(main), experimental: revision(root) });

timed('tasks', () => {
	const arms = [
		'--main',
		path.join(bin, 'tasks-main-arm'),
		'--experimental',
		path.join(bin, 'tasks-experimental-arm'),
		'--official',
		path.join(root, here, 'tasks-versus-main/official.ts'),
		'--out',
		path.join(results, 'tasks'),
		'--tasks',
		'parse,client,server,format',
	];
	node('tasks-versus-main/measure.ts', ['check', ...arms, '--inputs', at('sample.txt')]);
	fs.rmSync(path.join(results, 'tasks', 'wall.jsonl'), { force: true });
	node('tasks-versus-main/measure.ts', [
		'wall',
		...arms,
		'--threads',
		threads,
		'--repetitions',
		repetitions,
		'--rounds',
		rounds,
	]);
});

timed('lint', () => {
	const arms = [
		'--main',
		path.join(bin, 'lint-main-arm'),
		'--experimental',
		path.join(bin, 'lint-experimental-arm'),
		'--eslint',
		path.join(root, here, 'lint-versus-main/eslint.ts'),
		'--out',
		path.join(results, 'lint'),
	];
	const { main: mainRevision, experimental } = revisions();
	lintMeasure([
		'platform',
		...arms,
		'--main-revision',
		mainRevision,
		'--experimental-revision',
		experimental,
	]);
	lintMeasure(['universe', ...arms]);
	lintMeasure(['check', ...arms, '--inputs', at('sample.txt'), '--sample', '20']);
	fs.rmSync(path.join(results, 'lint', 'wall.jsonl'), { force: true });
	lintMeasure([
		'wall',
		...arms,
		'--repetitions',
		repetitions,
		'--rounds',
		rounds,
		'--threads',
		threads,
		'--allocators',
		'system',
	]);
});

timed('check', () => {
	const pins = checkPins();
	const languageTools = at('language-tools');
	if (!fs.existsSync(path.join(languageTools, 'packages/svelte-check/dist/src/index.js'))) {
		fs.rmSync(languageTools, { recursive: true, force: true });
		run('git', ['init', '-q', languageTools]);
		run(
			'git',
			[
				'fetch',
				'-q',
				'--depth',
				'1',
				'https://github.com/sveltejs/language-tools.git',
				pins.LANGUAGE_TOOLS_SHA!,
			],
			languageTools,
		);
		run('git', ['checkout', '-q', 'FETCH_HEAD'], languageTools);
		const pnpm = ['--yes', `pnpm@${pins.LANGUAGE_TOOLS_PNPM}`];
		for (const argv of [['install', '--frozen-lockfile'], ['bootstrap'], ['build']])
			run('npx', [...pnpm, ...argv], languageTools);
		run('npx', [...pnpm, 'build'], path.join(languageTools, 'packages/svelte-check'));
		if (
			!fs.existsSync(path.join(languageTools, 'packages/typescript-content-mapper/dist/server.js'))
		)
			run(
				'npx',
				[...pnpm, 'build'],
				path.join(languageTools, 'packages/typescript-content-mapper'),
			);
	}
	const tools = at('check-tools');
	if (!fs.existsSync(path.join(tools, 'node_modules'))) {
		fs.mkdirSync(tools, { recursive: true });
		fs.writeFileSync(path.join(tools, 'package.json'), '{"private":true}\n');
		run(
			'npm',
			[
				'install',
				'--no-audit',
				'--no-fund',
				`svelte-check@${pins.SVELTE_CHECK_VERSION}`,
				`typescript@${pins.TS6_VERSION}`,
				`ts7@npm:typescript@${pins.TS7_VERSION}`,
				`tsrs@${pins.TSRS_VERSION}`,
			],
			tools,
		);
		run('python3', ['-m', 'venv', at('venv')]);
		run(at('venv', 'bin', 'pip'), ['install', '--quiet', `psutil==${pins.PSUTIL_VERSION}`]);
	}
	const projects = at('check-projects');
	const prepared = spawnSync(
		process.execPath,
		[path.join(root, here, 'check-versus-svelte-check/prepare.ts'), checkProject, projects],
		{ cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
	);
	if (prepared.status !== 0) throw new Error('prepare.ts failed');
	const project = Object.fromEntries(
		prepared.stdout
			.split('\n')
			.filter((line) => line.includes('='))
			.map((line) => line.split(/=(.*)/s).slice(0, 2)),
	) as Record<string, string>;
	node(
		'check-versus-svelte-check/measure.ts',
		[
			'--id',
			checkProject,
			'--project',
			project.dir!,
			'--tsconfig',
			project.tsconfig!,
			'--language-tools',
			languageTools,
			'--tools',
			tools,
			'--rsvelte',
			path.join(bin, 'rsvelte-dev'),
			'--mapper',
			path.join(bin, 'rsvelte-svelte-content-mapper'),
			'--main-check',
			path.join(bin, 'svelte_check'),
			'--arms',
			'svelte-check-ts6,svelte-check-tsgo,svelte-check-tsrs,rsvelte-tsgo,rsvelte-tsrs,main-tsgo',
			'--rounds',
			checkRounds,
			'--warmup',
			'1',
			'--cold',
			'0',
			...(project.expect ? ['--expect-synthetic', project.expect] : []),
			'--out',
			path.join(results, 'check', `${checkProject}.json`),
		],
		{ BENCH_PYTHON: at('venv', 'bin', 'python'), RSVELTE_REVISION: revisions().experimental },
	);
});

timed('report', () => {
	fs.writeFileSync(
		path.join(results, 'run.json'),
		JSON.stringify(
			{
				revisions: revisions(),
				every,
				threads,
				repetitions,
				rounds,
				checkProject,
				checkRounds,
				durations,
			},
			null,
			'\t',
		) + '\n',
	);
	node('tasks-versus-main/report.ts', [results, path.join(results, 'report.md')]);
});
process.stdout.write(`\nseconds per step: ${JSON.stringify(durations)}\n`);
