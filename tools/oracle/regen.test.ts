import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { formatPack, readPack, writePack } from './pack.ts';
import { mergePack, select, updateUnparseable } from './regen.ts';

const entry = (p: string, body: string) => ({ path: p, attributes: ['js'], body });

test('a selected run replaces the selected entries and keeps the rest in pack order', () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'regen-'));
	const file = path.join(dir, 'default.pack');
	writePack(file, [entry('a.svelte', 'a'), entry('b.svelte', 'old'), entry('c.svelte', 'c')]);
	writePack(
		file,
		mergePack(file, [entry('b.svelte', 'new')], (p) => path.matchesGlob(p, 'b*')),
	);
	assert.equal(
		fs.readFileSync(file, 'utf8'),
		formatPack([entry('a.svelte', 'a'), entry('b.svelte', 'new'), entry('c.svelte', 'c')]),
	);
	fs.rmSync(dir, { recursive: true });
});

test('a selected unit with no new entry loses its old one', () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'regen-'));
	const file = path.join(dir, 'default.pack');
	writePack(file, [entry('a.svelte', 'a'), entry('b.svelte', 'old')]);
	writePack(
		file,
		mergePack(file, [], (p) => p === 'b.svelte'),
	);
	assert.deepEqual(readPack(file), [entry('a.svelte', 'a')]);
	fs.rmSync(dir, { recursive: true });
});

test('a pack that does not exist yet holds only the new entries', () => {
	const file = path.join(os.tmpdir(), 'regen-missing', 'default.pack');
	assert.deepEqual(
		mergePack(file, [entry('a.svelte', 'a')], () => true),
		[entry('a.svelte', 'a')],
	);
});

test('a unit key selects that unit alone, and any other path is a glob', () => {
	const keys = ['s/routes/[slug]/+page.svelte', 's/routes/s/+page.svelte', 's/a.svelte'];
	assert.deepEqual([...select(['s/routes/[slug]/+page.svelte'], keys)], [keys[0]]);
	assert.deepEqual(
		[...select(['s/*.svelte', 's/routes/s/+page.svelte'], keys)],
		[keys[2], keys[1]],
	);
	assert.deepEqual([...select(['t/*'], keys)], []);
});

test('a run rewrites the unparseable skips it covers and keeps the rest', () => {
	const before = [
		'# header',
		'svelte/s/a.svelte.ts\tts.compile/default\tstale',
		'svelte/s/b.svelte.ts\tts.compile/default\tkept',
		'',
	].join('\n');
	const after = updateUnparseable(
		before,
		(key, task) => task === 'ts.compile/default' && key !== 'svelte/s/b.svelte.ts',
		[
			{
				key: 'svelte/s/c.svelte.ts',
				task: 'ts.compile/default',
				ext: 'js',
				message: 'Unexpected token (1:2)',
			},
			{
				key: 'svelte/s/d.svelte',
				task: 'svelte.compile/client',
				ext: 'js',
				message: 'not recorded',
			},
		],
	);
	assert.deepEqual(after.split('\n').slice(1), [
		'svelte/s/b.svelte.ts\tts.compile/default\tkept',
		"svelte/s/c.svelte.ts\tts.compile/default\tTypeScript's emit does not parse as a module: Unexpected token (1:2) (typescript-emit-unparseable)",
		'',
	]);
});
