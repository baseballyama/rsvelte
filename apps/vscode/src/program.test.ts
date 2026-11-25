import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { findProgram } from './program.ts';

const CLI = path.resolve(import.meta.dirname, '../../cli');
const executable = `rsvelte${process.platform === 'win32' ? '.exe' : ''}`;

/** A directory holding `files`, a map from relative path to text. */
function project(files: Record<string, string>): string {
	const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-vscode-')));
	for (const [file, text] of Object.entries(files)) {
		fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
		fs.writeFileSync(path.join(root, file), text);
	}
	return root;
}

/** The files of an installed @rsvelte/cli at `at`, with the lookup it ships and `platform`. */
function cli(at: string, platform: string): Record<string, string> {
	return {
		[`${at}/package.json`]: '{ "name": "@rsvelte/cli", "version": "9.9.9", "type": "module" }',
		[`${at}/platforms.json`]: JSON.stringify({ [`${process.platform}-${process.arch}`]: platform }),
		[`${at}/bin/program.js`]: fs.readFileSync(path.join(CLI, 'program.js'), 'utf8'),
	};
}

test('a folder without @rsvelte/cli has no program', async () => {
	assert.equal(await findProgram(project({ 'package.json': '{}' })), undefined);
});

test('the program is the one the platform package beside @rsvelte/cli holds', async () => {
	const root = project({
		...cli('node_modules/@rsvelte/cli', 'rsvelte-here'),
		[`node_modules/rsvelte-here/${executable}`]: '',
		'node_modules/rsvelte-here/package.json': '{ "name": "rsvelte-here" }',
	});
	// A folder below the project resolves through its parents, as a monorepo package does.
	fs.mkdirSync(path.join(root, 'packages/app'), { recursive: true });
	const folders = [root, path.join(root, 'packages/app')];
	const found = await Promise.all(folders.map(findProgram));
	const program = path.join(root, 'node_modules/rsvelte-here', executable);
	assert.deepEqual(found, [{ program }, { program }]);
});

test('pnpm: the platform package resolves from the real directory of @rsvelte/cli', async () => {
	const store = 'node_modules/.pnpm/@rsvelte+cli@9.9.9/node_modules';
	const root = project({
		...cli(`${store}/@rsvelte/cli`, 'rsvelte-here'),
		[`${store}/rsvelte-here/${executable}`]: '',
		[`${store}/rsvelte-here/package.json`]: '{ "name": "rsvelte-here" }',
	});
	fs.mkdirSync(path.join(root, 'node_modules/@rsvelte'), { recursive: true });
	fs.symlinkSync(
		path.join(root, store, '@rsvelte/cli'),
		path.join(root, 'node_modules/@rsvelte/cli'),
		'dir',
	);
	assert.deepEqual(await findProgram(root), {
		program: path.join(root, store, 'rsvelte-here', executable),
	});
});

test('an @rsvelte/cli without the platform package or without the lookup says why', async () => {
	const missing = await findProgram(project(cli('node_modules/@rsvelte/cli', 'rsvelte-gone')));
	assert.match((missing as { problem: string }).problem, /rsvelte-gone is not installed/);
	const old = project({ 'node_modules/@rsvelte/cli/package.json': '{ "version": "0.5.1" }' });
	assert.match(
		((await findProgram(old)) as { problem: string }).problem,
		/@rsvelte\/cli 0\.5\.1 .* has no language server/,
	);
});
