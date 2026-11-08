// Runs the performance ratchet in the CI runner's environment (linux.Dockerfile), with
// instruction counts: `performance linux` checks, `performance linux --update` records.
//
// The container builds a snapshot of the sources and the fixtures as staged (the index) when this
// starts: what is measured is what the next commit holds, as CI's clean checkout does, and the
// working tree can be edited meanwhile. (Loading walks the fixture tree, so outputs a local run
// left in it would count.) With --update the snapshot's baseline is copied back (stage it too).
// The host's cargo registry is mounted (the build is --offline), and the Linux build has a target
// directory of its own.
//
// The container copies the snapshot onto its own file system, at the paths CI uses, before it
// measures: loading counted 0.26% more instructions there than over the bind mount, more than the
// tolerance, and paths are embedded in the binary.
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
	const checkout = '/home/runner/work/rsvelte/rsvelte';
	const script = [
		'set -e',
		`mkdir -p ${checkout}`,
		`cp -a /source/. ${checkout}/`,
		`rm -rf ${checkout}/target`,
		`ln -s /target ${checkout}/target`,
		`cd ${checkout}`,
		'node tools/performance/performance.ts ratchet --instructions "$@"',
		'cp tools/performance/baseline.json /source/tools/performance/baseline.json',
	].join('\n');
	const run = spawnSync(
		'docker',
		[
			'run',
			'--rm',
			'-e',
			'HOME=/home/runner',
			'-e',
			'CARGO_HOME=/home/runner/.cargo',
			'-e',
			'RUSTUP_HOME=/root/.rustup',
			'-v',
			`${source}:/source`,
			'-v',
			`${target}:/target`,
			'-v',
			`${registry}:/home/runner/.cargo/registry`,
			'rsvelte-performance',
			'sh',
			'-c',
			script,
			'sh',
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
