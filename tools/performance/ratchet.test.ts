import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { test } from 'node:test';

const source = import.meta.dirname;
const WAIT_MS = 20_000;
// A stand-in for cargo that "builds" an rsvelte which writes a report, then waits on a file barrier.
// The report's `rev` is the path the ratchet ran, so a test can see which binary was measured.
const CARGO = `#!/bin/sh
if [ "$1" = --version ]; then echo 'cargo 0.0.0 (fake)'; exit 0; fi
printf '%s' "$CARGO_BUILD_JOBS" > "$FAKE_DIR/jobs-$FAKE_ROLE"
previous=''
for argument in "$@"; do [ "$previous" = --profile ] && profile="$argument"; previous="$argument"; done
out="$CARGO_TARGET_DIR/$profile"
mkdir -p "$out"
cat > "$out/rsvelte-dev.$$" <<'RSVELTE'
#!/bin/sh
for argument in "$@"; do case "$argument" in json=*) out="\${argument#json=}";; esac; done
printf '{"rev":"%s","metrics":true,"documents":%s,"source_bytes":1,"output_bytes":1,"tasks":[],"allocs":1,"alloc_bytes":1,"peak_live_growth_bytes":1,"phases":{}}' "$0" "$FAKE_DOCUMENTS" > "$out"
touch "$FAKE_DIR/wrote-$FAKE_ROLE"
if [ "$FAKE_ROLE" = first ]; then
  tries=0
  while [ ! -e "$FAKE_DIR/wrote-second" ] && [ $tries -lt 400 ]; do sleep 0.05; tries=$((tries + 1)); done
fi
RSVELTE
chmod +x "$out/rsvelte-dev.$$"
# A rename keeps the running script of the other run intact.
mv "$out/rsvelte-dev.$$" "$out/rsvelte-dev"
`;

/** Resolves when `file` exists; fails when `exit` settles first or after WAIT_MS. */
function waitFor(file: string, exit: Promise<unknown>): Promise<void> {
	return new Promise((resolve, reject) => {
		const name = path.basename(file);
		const watcher = fs.watch(path.dirname(file));
		const timer = setTimeout(() => settle(new Error(`timed out waiting for ${name}`)), WAIT_MS);
		let settled = false;
		function settle(error?: Error) {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			watcher.close();
			if (error) reject(error);
			else resolve();
		}
		const check = () => fs.existsSync(file) && settle();
		watcher.on('change', check);
		void exit.then(
			() => check() || settle(new Error(`the first run exited before writing ${name}`)),
		);
		// The file may have appeared before the watcher started.
		check();
	});
}

test(
	'two ratchet runs in one tree read their own report from their own binary copy',
	{ skip: process.platform === 'win32', timeout: 3 * WAIT_MS },
	async () => {
		const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-ratchet-'));
		let first: ReturnType<typeof spawn> | undefined;
		try {
			fs.writeFileSync(path.join(directory, 'cargo'), CARGO, { mode: 0o755 });
			// The ratchet builds into <root>/target, so it runs from a copy to keep the real binaries.
			const root = path.join(directory, 'root');
			fs.mkdirSync(path.join(root, 'tools/performance'), { recursive: true });
			for (const file of ['performance.ts', 'ratchet.ts', 'baseline.json'])
				fs.copyFileSync(path.join(source, file), path.join(root, 'tools/performance', file));
			const ratchet = path.join(root, 'tools/performance/performance.ts');
			const env = (role: string, documents: number) => ({
				...process.env,
				PATH: `${directory}${path.delimiter}${process.env.PATH}`,
				FAKE_DIR: directory,
				FAKE_ROLE: role,
				FAKE_DOCUMENTS: String(documents),
				CARGO_BUILD_JOBS: '1',
			});
			first = spawn(process.execPath, [ratchet, 'ratchet'], { cwd: root, env: env('first', 1111) });
			let firstOut = '';
			first.stdout!.on('data', (chunk) => (firstOut += chunk));
			const firstExit = new Promise((resolve) => first!.on('exit', resolve));
			await waitFor(path.join(directory, 'wrote-first'), firstExit);
			const second = spawnSync(process.execPath, [ratchet, 'ratchet'], {
				cwd: root,
				env: env('second', 2222),
				encoding: 'utf8',
				timeout: WAIT_MS,
			});
			await firstExit;
			assert.match(second.stdout, /: 2,222 documents/);
			assert.match(firstOut, /: 1,111 documents/, "the first run read the second run's report");
			const measured = /rsvelte-dev performance at (\S+):/.exec(firstOut)?.[1];
			assert.ok(measured, firstOut);
			// The ratchet sees its root through realpath (/var is /private/var on macOS); compare in both spellings.
			for (const shared of new Set([
				path.join(root, 'target'),
				path.join(fs.realpathSync(root), 'target'),
			])) {
				assert.ok(
					!measured.startsWith(shared),
					`the first run measured the shared build output ${measured}`,
				);
			}
			assert.ok(path.isAbsolute(measured) && path.basename(measured) === 'rsvelte-dev', measured);
			assert.equal(fs.readFileSync(path.join(directory, 'jobs-first'), 'utf8'), '1');
		} finally {
			// The test owns this child; a failed assertion must not leave it waiting on the barrier.
			if (first && first.exitCode === null && first.signalCode === null) first.kill();
			fs.rmSync(directory, { recursive: true, force: true });
		}
	},
);

test('--no-allocations is refused without --instructions and with --update', () => {
	const ratchet = path.join(source, 'performance.ts');
	for (const argv of [['--no-allocations'], ['--no-allocations', '--instructions', '--update']]) {
		const run = spawnSync(process.execPath, [ratchet, 'ratchet', ...argv], { encoding: 'utf8' });
		assert.notEqual(run.status, 0, argv.join(' '));
		assert.match(run.stderr, /--no-allocations needs --instructions/);
	}
});

// A stand-in for valgrind whose instruction count grows with the rounds it is asked for.
const VALGRIND = `#!/bin/sh
for argument in "$@"; do case "$argument" in rounds=*) rounds="\${argument#rounds=}";; esac; done
echo "==1== I   refs:      $((1000 + rounds * 100))" >&2
`;

test(
	'--no-allocations compares the instruction counters alone',
	{ skip: process.platform === 'win32', timeout: 3 * WAIT_MS },
	() => {
		const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-ratchet-'));
		try {
			fs.writeFileSync(path.join(directory, 'cargo'), CARGO, { mode: 0o755 });
			fs.writeFileSync(path.join(directory, 'valgrind'), VALGRIND, { mode: 0o755 });
			const root = path.join(directory, 'root');
			fs.mkdirSync(path.join(root, 'tools/performance'), { recursive: true });
			for (const file of ['performance.ts', 'ratchet.ts'])
				fs.copyFileSync(path.join(source, file), path.join(root, 'tools/performance', file));
			const platform = `${process.arch}-${process.platform}`;
			// Every allocation counter is off by one; the instruction counters match the stand-ins.
			const baseline = {
				population: { documents: 1111, source_bytes: 1, tasks: [] },
				allocs: 2,
				alloc_bytes: 1,
				peak_live_growth_bytes: 1,
				phases: {},
				instructions: { [platform]: 100 },
				load_instructions: { [platform]: 1000 },
				instruction_sample: { every: 20, documents: 1111, source_bytes: 1 },
			};
			fs.writeFileSync(
				path.join(root, 'tools/performance/baseline.json'),
				JSON.stringify(baseline),
			);
			const run = (...argv: string[]) =>
				spawnSync(
					process.execPath,
					[path.join(root, 'tools/performance/performance.ts'), 'ratchet', ...argv],
					{
						cwd: root,
						env: {
							...process.env,
							PATH: `${directory}${path.delimiter}${process.env.PATH}`,
							FAKE_DIR: directory,
							FAKE_ROLE: 'second',
							FAKE_DOCUMENTS: '1111',
						},
						encoding: 'utf8',
						timeout: WAIT_MS,
					},
				);
			const instructions = run('--instructions', '--no-allocations');
			assert.equal(instructions.status, 0, instructions.stderr);
			assert.match(instructions.stdout, /^2 counters compared, 0 moved$/m);
			const full = run('--instructions');
			assert.notEqual(full.status, 0, full.stdout);
			assert.match(full.stderr, /FAIL allocs: 2 -> 1/);
		} finally {
			fs.rmSync(directory, { recursive: true, force: true });
		}
	},
);
