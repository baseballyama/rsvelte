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
printf '%s' "$CARGO_BUILD_JOBS" > "$FAKE_DIR/jobs-$FAKE_ROLE"
mkdir -p "$CARGO_TARGET_DIR/release"
cat > "$CARGO_TARGET_DIR/release/rsvelte.$$" <<'RSVELTE'
#!/bin/sh
for argument in "$@"; do case "$argument" in json=*) out="\${argument#json=}";; esac; done
printf '{"rev":"%s","metrics":true,"documents":%s,"source_bytes":1,"output_bytes":1,"tasks":[],"allocs":1,"alloc_bytes":1,"peak_live_growth_bytes":1,"phases":{}}' "$0" "$FAKE_DOCUMENTS" > "$out"
touch "$FAKE_DIR/wrote-$FAKE_ROLE"
if [ "$FAKE_ROLE" = first ]; then
  tries=0
  while [ ! -e "$FAKE_DIR/wrote-second" ] && [ $tries -lt 400 ]; do sleep 0.05; tries=$((tries + 1)); done
fi
RSVELTE
chmod +x "$CARGO_TARGET_DIR/release/rsvelte.$$"
# A rename keeps the running script of the other run intact.
mv "$CARGO_TARGET_DIR/release/rsvelte.$$" "$CARGO_TARGET_DIR/release/rsvelte"
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
			const measured = /rsvelte performance at (\S+):/.exec(firstOut)?.[1];
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
			assert.ok(path.isAbsolute(measured) && path.basename(measured) === 'rsvelte', measured);
			assert.equal(fs.readFileSync(path.join(directory, 'jobs-first'), 'utf8'), '1');
		} finally {
			// The test owns this child; a failed assertion must not leave it waiting on the barrier.
			if (first && first.exitCode === null && first.signalCode === null) first.kill();
			fs.rmSync(directory, { recursive: true, force: true });
		}
	},
);
