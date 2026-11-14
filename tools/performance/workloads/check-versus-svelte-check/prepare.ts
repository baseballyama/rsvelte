// `prepare.ts <project> <work directory>`: installs one project and prints `dir=`, `tsconfig=` and
// `expect=` lines for `$GITHUB_OUTPUT`. A real project is fetched at a pinned commit and installed
// from its own lockfile with the pnpm release it declares. `synthetic-<N>` is written by
// `synthetic.ts`, and `expect` is its component count.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { writeSynthetic } from './synthetic.ts';

type Project = {
	repository: string;
	revision: string;
	pnpm: string;
	install: string[];
	/** The directory whose `package.json` runs `svelte-check` upstream. */
	directory: string;
	/** `pnpm` runs the project's pnpm in `directory`; `pnpm-root` in the checkout's root. */
	prepare: [program: 'pnpm' | 'pnpm-root' | string, ...arguments: string[]][];
};

const PROJECTS: Record<string, Project> = {
	'bits-ui': {
		repository: 'https://github.com/huntabyte/bits-ui.git',
		revision: '314c243831dbce1db9ddb9c119fcd58b525da882',
		pnpm: '10.33.0',
		install: ['install', '--frozen-lockfile', '--ignore-scripts', '--filter', 'bits-ui...'],
		directory: 'packages/bits-ui',
		prepare: [['node_modules/.bin/svelte-kit', 'sync']],
	},
	'skeleton-svelte': {
		repository: 'https://github.com/skeletonlabs/skeleton.git',
		revision: 'd910f5096c4e96b5901eda84d5a5b46e582806f1',
		pnpm: '11.17.0',
		install: [
			'install',
			'--frozen-lockfile',
			'--ignore-scripts',
			'--filter',
			'@skeletonlabs/skeleton-svelte...',
		],
		directory: 'packages/skeleton-svelte',
		prepare: [],
	},
	'flowbite-svelte': {
		repository: 'https://github.com/themesberg/flowbite-svelte.git',
		revision: '85f20a048ec51598e2be099bd57b5f555fe7a5b4',
		pnpm: '10.33.0',
		install: ['install', '--frozen-lockfile', '--ignore-scripts'],
		directory: '.',
		prepare: [['node_modules/.bin/svelte-kit', 'sync']],
	},
	'shadcn-svelte-docs': {
		repository: 'https://github.com/huntabyte/shadcn-svelte.git',
		revision: 'fe4b0ad3b8b30c6745346db008c3307b5afeabb1',
		pnpm: '10.32.1',
		install: ['install', '--frozen-lockfile', '--ignore-scripts', '--filter', 'docs...'],
		directory: 'docs',
		// Upstream's `pnpm sync`: the routes import the generated registry and content, so without
		// it most imports are unresolved. The registry script imports the workspace's own CLI.
		prepare: [
			['pnpm-root', '--filter', 'shadcn-svelte', 'run', 'build'],
			['pnpm', 'run', 'sync'],
		],
	},
};

function run(program: string, args: string[], cwd: string): void {
	process.stderr.write(`$ (cd ${cwd} && ${program} ${args.join(' ')})\n`);
	const result = spawnSync(program, args, { cwd, stdio: ['ignore', 2, 2] });
	if (result.status !== 0)
		throw new Error(`${program} failed with ${result.status ?? result.signal}`);
}

function prepare(id: string, work: string): string {
	const synthetic = /^synthetic-(\d+)$/.exec(id);
	if (synthetic) {
		const directory = path.resolve(work, id);
		writeSynthetic(directory, Number(synthetic[1]));
		run('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts'], directory);
		return `dir=${directory}\ntsconfig=tsconfig.json\nexpect=${synthetic[1]}\n`;
	}
	const project = PROJECTS[id];
	if (!project)
		throw new Error(`unknown project ${id}; known: ${Object.keys(PROJECTS).join(', ')}`);
	const root = path.resolve(work, id);
	fs.rmSync(root, { recursive: true, force: true });
	fs.mkdirSync(root, { recursive: true });
	run('git', ['init', '--quiet'], root);
	run('git', ['fetch', '--quiet', '--depth', '1', project.repository, project.revision], root);
	run('git', ['checkout', '--quiet', 'FETCH_HEAD'], root);
	const pnpm = ['--yes', `pnpm@${project.pnpm}`];
	run('npx', [...pnpm, ...project.install], root);
	const directory = path.join(root, project.directory);
	for (const [program, ...args] of project.prepare) {
		if (program === 'pnpm') run('npx', [...pnpm, ...args], directory);
		else if (program === 'pnpm-root') run('npx', [...pnpm, ...args], root);
		else run(path.join(directory, program), args, directory);
	}
	return `dir=${directory}\ntsconfig=tsconfig.json\nexpect=\n`;
}

if (import.meta.main) {
	const [id, work] = process.argv.slice(2);
	if (!id || !work) throw new Error('usage: prepare.ts <project> <work directory>');
	process.stdout.write(prepare(id, work));
}
