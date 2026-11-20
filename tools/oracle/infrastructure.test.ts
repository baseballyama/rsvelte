import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { isInfrastructureError } from './infrastructure.ts';
import { readPack } from './pack.ts';

test('a system error of the machine is an infrastructure error', () => {
	for (const text of [
		"ENOSPC: no space left on device, mkdtemp '/var/folders/T/svelte-check-XXXXXX'\n",
		"EMFILE: too many open files, open '/tmp/x/a.svelte'\n",
		'ENOMEM: not enough memory, read\n',
		'Command failed: node svelte-check\nEAGAIN: resource temporarily unavailable, spawn\n',
	])
		assert.equal(isInfrastructureError(text), true, text);
});

test('a real system error is recognised', () => {
	let message = '';
	try {
		fs.mkdtempSync(path.join(os.tmpdir(), 'no-such-directory', 'x-'));
	} catch (e) {
		message = (e as Error).message;
	}
	assert.match(message, /^ENOENT/);
	assert.equal(isInfrastructureError(message), true);
});

test("an oracle's refusal is not an infrastructure error", () => {
	for (const text of [
		'Unexpected token\nhttps://svelte.dev/e/js_parse_error\n',
		'`$state` cannot be used here\n',
		'svelte-check did not complete:\nGetting Svelte diagnostics...\n',
		'ENOSPC is the code for a full disk\n',
		'Expected token }, found EOF\n',
	])
		assert.equal(isInfrastructureError(text), false, text);
});

test('no expected entry in the corpus is an infrastructure error', () => {
	const corpus = path.resolve(import.meta.dirname, '../../corpus');
	const packs = fs
		.readdirSync(corpus, { recursive: true, encoding: 'utf8' })
		.filter((f) => f.includes(`${path.sep}expected${path.sep}`) && f.endsWith('.pack'));
	assert.ok(packs.length > 100, `only ${packs.length} expected packs`);
	const bad = packs.flatMap((f) =>
		readPack(path.join(corpus, f))
			.filter((e) => e.attributes.includes('error.txt') && isInfrastructureError(e.body))
			.map((e) => `${f} ${e.path}`),
	);
	assert.deepEqual(bad, []);
});
