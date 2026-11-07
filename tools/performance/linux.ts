// Runs the performance ratchet in the CI runner's environment (linux.Dockerfile), with
// instruction counts: `performance linux` checks, `performance linux --update` records.
//
// The container builds a snapshot of the sources and the fixtures as staged (the index) when this
// starts: what is measured is what the next commit holds, as CI's clean checkout does, and the
// working tree can be edited meanwhile. (Loading walks the fixture tree, so outputs a local run
// left in it would count.) With --update the snapshot's baseline is copied back (stage it too).
// The host's cargo registry is mounted (the build is --offline), and the Linux build has a target
// directory of its own.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export async function main(args: string[]): Promise<void> {
	const root = path.resolve(import.meta.dirname, '../..');
	const source = path.join(import.meta.dirname, 'generated/linux-source');
	const target = path.join(root, 'target/linux');
	fs.rmSync(source, { recursive: true, force: true });
	fs.mkdirSync(source, { recursive: true });
	fs.mkdirSync(target, { recursive: true });
	const staged = execFileSync(
		'git',
		[
			'-C',
			root,
			'ls-files',
			'-z',
			'--',
			'Cargo.toml',
			'Cargo.lock',
			'rust-toolchain.toml',
			'crates',
			'tools/performance',
			'corpus',
		],
		{ encoding: 'utf8', maxBuffer: 1 << 28 },
	)
		.split('\0')
		.filter(Boolean);
	execFileSync(
		'git',
		['-C', root, 'checkout-index', '--force', `--prefix=${source}/`, '--stdin', '-z'],
		{ input: staged.join('\0') },
	);
	execFileSync(
		'docker',
		[
			'build',
			'-q',
			'-t',
			'rsvelte-performance',
			'-f',
			path.join(import.meta.dirname, 'linux.Dockerfile'),
			import.meta.dirname,
		],
		{
			stdio: ['ignore', 'ignore', 'inherit'],
		},
	);
	const registry = path.join(
		process.env.CARGO_HOME ?? path.join(os.homedir(), '.cargo'),
		'registry',
	);
	const run = spawnSync(
		'docker',
		[
			'run',
			'--rm',
			'-v',
			`${source}:/w`,
			'-v',
			`${target}:/w/target`,
			'-v',
			`${registry}:/root/.cargo/registry`,
			'rsvelte-performance',
			'node',
			'tools/performance/performance.ts',
			'ratchet',
			'--instructions',
			...args,
		],
		{ stdio: 'inherit' },
	);
	if (run.status !== 0) process.exit(run.status ?? 1);
	if (args.includes('--update'))
		fs.copyFileSync(
			path.join(source, 'tools/performance/baseline.json'),
			path.join(import.meta.dirname, 'baseline.json'),
		);
}
