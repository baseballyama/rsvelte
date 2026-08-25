import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
	buildReport,
	collectSvelteFiles,
	compareSource,
	formatHumanReport,
	parseArgs,
} from '../lib/compare.mjs';

test('parses compare options and defaults to the current directory', () => {
	assert.deepEqual(parseArgs([]), {
		dev: false,
		generate: 'client',
		help: false,
		json: false,
		optionsPath: null,
		paths: ['.'],
	});
	assert.deepEqual(parseArgs(['--generate=both', '--dev', '--json', 'src/**/*.svelte']).generate, 'both');
	assert.throws(() => parseArgs(['--generate', 'worker']), /Invalid --generate value/);
});

test('collects direct, directory, and glob inputs without node_modules', async () => {
	const root = await mkdtemp(join(tmpdir(), 'rsvelte-compare-'));
	await mkdir(join(root, 'src', 'nested'), { recursive: true });
	await mkdir(join(root, 'node_modules', 'fixture'), { recursive: true });
	await writeFile(join(root, 'src', 'App.svelte'), '<h1>app</h1>');
	await writeFile(join(root, 'src', 'nested', 'Child.svelte'), '<p>child</p>');
	await writeFile(join(root, 'node_modules', 'fixture', 'Skip.svelte'), '<p>skip</p>');

	const directory = await collectSvelteFiles(['.'], root);
	assert.equal(directory.length, 2);
	const glob = await collectSvelteFiles(['src/**/*.svelte'], root);
	assert.deepEqual(glob, directory);
	const direct = await collectSvelteFiles(['src/App.svelte'], root);
	assert.deepEqual(direct, [join(root, 'src', 'App.svelte')]);
});

test('compares generated JS and CSS without including source maps', () => {
	const officialCompile = () => ({
		js: { code: 'const answer = 42;', map: { different: true } },
		css: { code: '.x{}', map: { different: true } },
	});
	const matching = compareSource({
		source: '<p>x</p>',
		filename: 'App.svelte',
		target: 'client',
		options: {},
		officialCompile,
		rsvelteCompile: () => JSON.stringify({ js: { code: 'const answer = 42;' }, css: { code: '.x{}' } }),
	});
	assert.equal(matching.match, true);

	const different = compareSource({
		source: '<p>x</p>',
		filename: 'App.svelte',
		target: 'client',
		options: {},
		officialCompile,
		rsvelteCompile: () => ({ js: { code: 'const answer = 43;' }, css: { code: '.x{}' } }),
	});
	assert.equal(different.match, false);
	assert.deepEqual(different.differences[0], {
		artifact: 'js.code',
		line: 1,
		column: 17,
		official: 'const answer = 42;',
		rsvelte: 'const answer = 43;',
	});
});

test('reports compile failures and file-level summaries', () => {
	const comparison = compareSource({
		source: '{',
		filename: 'Broken.svelte',
		target: 'server',
		options: {},
		officialCompile: () => {
			const error = new Error('unexpected token');
			error.code = 'expected_token';
			throw error;
		},
		rsvelteCompile: () => assert.fail('rsvelte must not run after the oracle rejects'),
	});
	const report = buildReport([{ file: 'Broken.svelte', match: false, comparisons: [comparison] }]);
	assert.equal(report.different, 1);
	assert.match(formatHumanReport(report), /\[server\] official failed \(expected_token\): unexpected token/);
});
