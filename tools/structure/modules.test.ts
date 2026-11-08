// A parent declares a module that only lists child modules inline, so the module tree reads
// from the parent and no file exists only to list other files. Tests sit in their own `tests.rs`,
// so a file's line count and diff are its code alone.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '../..');

/** Tracked and new Rust files. */
function rustFiles(): string[] {
	const git = { cwd: root, encoding: 'utf8', maxBuffer: Infinity } as const;
	const list = (args: string[]) =>
		execFileSync('git', ['ls-files', '-z', ...args, '--', 'crates', 'tools', 'apps'], git)
			.split('\0')
			.filter(Boolean);
	const deleted = new Set(list(['--deleted']));
	return list(['--cached', '--others', '--exclude-standard']).filter(
		(file) => !deleted.has(file) && file.endsWith('.rs'),
	);
}

/** Files under a `src/` directory, without crate roots. */
function moduleFiles(files: string[]): string[] {
	return files
		.filter((file) => file.includes('/src/'))
		.filter((file) => !/\/src\/(lib|main)\.rs$/.test(file) && !/\/src\/bin\//.test(file));
}

/** True when the text writes a test module inline instead of in `tests.rs`. */
function hasInlineTests(text: string): boolean {
	return /^\s*mod tests \{/m.test(text);
}

/** True when the text, past comments and attributes, is one or more `mod name;` lines. */
function onlyDeclaresModules(text: string): boolean {
	const lines = text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line !== '' && !line.startsWith('//') && !/^#!?\[.*\]$/.test(line));
	return (
		lines.length > 0 &&
		lines.every((line) =>
			/^(pub(\((crate|super|self|in [a-z_:]+)\))? )?mod [a-z_0-9]+;$/.test(line),
		)
	);
}

test('no module file only declares submodules', () => {
	const files = moduleFiles(rustFiles());
	assert.ok(files.length > 300, `the check saw ${files.length} files`);
	const failures = files.filter((file) =>
		onlyDeclaresModules(readFileSync(resolve(root, file), 'utf8')),
	);
	assert.deepEqual(failures, [], 'write these modules inline in their parent');
});

test('the check tells a declaration-only file from one with code', () => {
	assert.equal(onlyDeclaresModules('//! Doc.\n\npub mod a;\npub(crate) mod b;\n'), true);
	assert.equal(onlyDeclaresModules('#[cfg(test)]\nmod tests;\nmod c;\n'), true);
	assert.equal(onlyDeclaresModules('pub mod a;\npub use a::A;\n'), false);
	assert.equal(onlyDeclaresModules('mod a;\nfn f() {}\n'), false);
	assert.equal(onlyDeclaresModules('//! Only a comment.\n'), false);
});

test('no file writes its tests inline', () => {
	const files = rustFiles();
	assert.ok(files.length > 500, `the check saw ${files.length} files`);
	const failures = files.filter((file) =>
		hasInlineTests(readFileSync(resolve(root, file), 'utf8')),
	);
	assert.deepEqual(failures, [], 'move these tests to `tests.rs` and declare `mod tests;`');
});

test('the check tells inline tests from a declared test module', () => {
	assert.equal(hasInlineTests('#[cfg(test)]\nmod tests {\n    #[test]\n    fn t() {}\n}\n'), true);
	assert.equal(hasInlineTests('mod imp {\n    #[cfg(test)]\n    mod tests {}\n}\n'), true);
	assert.equal(hasInlineTests('#[cfg(test)]\nmod tests;\n'), false);
	assert.equal(hasInlineTests('mod tests_support {}\n'), false);
});
