// The package's `rsvelte` command, run inside Node.js by the addon, does what the `rsvelte`
// executable does. RSVELTE_BINDING names the built addon and RSVELTE_COMMAND the executable;
// crates/hosts/node's test builds both and runs this file.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const bin = join(import.meta.dirname, 'bin.js');
const executable = process.env.RSVELTE_COMMAND;

/** A new directory holding `files`. */
function project(files: Record<string, string>) {
	const directory = mkdtempSync(join(tmpdir(), 'rsvelte-command-'));
	for (const [name, text] of Object.entries(files)) writeFileSync(join(directory, name), text);
	return directory;
}

/** The time oxfmt and oxlint report differs between runs. */
const timeless = (text: string) => text.replace(/\b\d+(\.\d+)?(ms|s)\b/g, '<time>');

/** What one run printed and returned. */
function ran(program: string, argv: string[], directory: string) {
	const { error, status, stdout, stderr } = spawnSync(program, argv, {
		cwd: directory,
		encoding: 'utf8',
		// oxlint colours its report wherever `CI` or `FORCE_COLOR` is set.
		env: { ...process.env, CI: undefined, FORCE_COLOR: undefined },
	});
	if (error) throw error;
	return { status, stdout: timeless(stdout), stderr: timeless(stderr) };
}

/** Runs both commands with `argv`, each in its own copy of `files`. */
function both(argv: string[], files: Record<string, string> = {}) {
	assert.ok(executable, 'RSVELTE_COMMAND names the rsvelte executable');
	const directories = [project(files), project(files)] as const;
	try {
		const ours = ran(process.execPath, [bin, ...argv], directories[0]);
		const theirs = ran(executable, argv, directories[1]);
		const after = directories.map((directory) =>
			Object.keys(files).map((name) => readFileSync(join(directory, name), 'utf8')),
		);
		return { ours: { ...ours, files: after[0] }, theirs: { ...theirs, files: after[1] } };
	} finally {
		for (const directory of directories) rmSync(directory, { recursive: true, force: true });
	}
}

const UNFORMATTED = { 'a.ts': 'const a   =  1\n', 'b.ts': 'export const b = 2;\n' };

for (const argv of [
	['--version'],
	['--help'],
	['help', 'typecheck'],
	// oxlint's guide is longer than a pipe holds, so a write that cannot block would fail.
	['lint', '--help'],
	['format', '--help'],
	['nonsense'],
	[],
]) {
	test(`rsvelte ${argv.join(' ')} prints and returns what the executable does`, () => {
		const { ours, theirs } = both(argv);
		assert.deepEqual(ours, theirs);
	});
}

test('rsvelte format --check and format read and write the files as the executable does', () => {
	for (const argv of [['format', '--check'], ['format']]) {
		const { ours, theirs } = both(argv, UNFORMATTED);
		assert.deepEqual(ours, theirs);
	}
	assert.equal(both(['format', '--check'], UNFORMATTED).ours.status, 1);
});

test('rsvelte lint reports what the executable reports', () => {
	const { ours, theirs } = both(['lint'], { 'a.ts': 'debugger;\n' });
	assert.deepEqual(ours, theirs);
	assert.match(ours.stdout, /no-debugger/);
});
