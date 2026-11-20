import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { machineFailure } from './infrastructure.ts';
import { readPack } from './pack.ts';

/** The message of the error `f` throws. */
const thrown = (f: () => unknown): string => {
	try {
		f();
	} catch (e) {
		return (e as Error).message;
	}
	throw new Error('nothing was thrown');
};

const node = (args: string[], options = {}) =>
	execFileSync(process.execPath, args, { stdio: 'pipe', ...options });
const missing = path.join(os.tmpdir(), 'no-such-directory', 'x-');

test('a failure of the machine is recognised, with its cause', () => {
	const cases: [string, string, string][] = [
		[
			'a full disk',
			"ENOSPC: no space left on device, mkdtemp '/var/folders/T/svelte-check-XXXXXX'\n",
			'a system call failed',
		],
		[
			'too many open files',
			"EMFILE: too many open files, open '/tmp/a.svelte'\n",
			'a system call failed',
		],
		['a failed mkdtemp here', thrown(() => fs.mkdtempSync(missing)), 'a system call failed'],
		[
			'a failed mkdtemp in a child',
			thrown(() => node(['-e', `require('fs').mkdtempSync(${JSON.stringify(missing)})`])),
			'a system call failed',
		],
		[
			'a missing program',
			thrown(() => execFileSync(path.join(missing, 'bin'))),
			'a child process could not run',
		],
		[
			'an overflowing output buffer',
			thrown(() => node(['-e', 'process.stdout.write("x".repeat(1e5))'], { maxBuffer: 10 })),
			'a child process could not run',
		],
		[
			'a child out of memory',
			thrown(() =>
				node([
					'--max-old-space-size=8',
					'-e',
					'const a = []; for (;;) a.push(new Array(1e5).fill(1));',
				]),
			),
			'a child process ran out of memory',
		],
	];
	for (const [name, text, cause] of cases) assert.equal(machineFailure(text), cause, name);
});

test("an oracle's refusal is not a failure of the machine", () => {
	for (const text of [
		'Unexpected token\nhttps://svelte.dev/e/js_parse_error\n',
		'`$state` cannot be used here\n',
		'svelte-check did not complete:\nGetting Svelte diagnostics...\n',
		'ENOSPC is the code for a full disk\n',
		'Expected token }, found EOF\n',
		'Error: Expected a valid element or component name, found E1\n',
		'spawnSync is not a function\n',
	])
		assert.equal(machineFailure(text), undefined, text);
});

test("no expected entry of the corpus is a failure of the oracle's machine", () => {
	const corpus = path.resolve(import.meta.dirname, '../../corpus');
	const refusals = fs
		.readdirSync(corpus, { recursive: true, encoding: 'utf8' })
		.filter((f) => f.includes(`${path.sep}expected${path.sep}`) && f.endsWith('.pack'))
		.flatMap((f) =>
			readPack(path.join(corpus, f))
				.filter((e) => e.attributes.includes('error.txt'))
				.map((e) => ({ at: `${f} ${e.path}`, body: e.body })),
		);
	assert.ok(refusals.length > 1000, `only ${refusals.length} refusals`);
	assert.deepEqual(
		refusals.filter((r) => machineFailure(r.body)).map((r) => r.at),
		[],
	);
});
