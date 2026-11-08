// A parent declares a module that only lists child modules inline, so the module tree reads
// from the parent and no file exists only to list other files. Tests sit in their own `tests.rs`,
// so a file's line count and diff are its code alone. A parent keeps no item that one child
// alone uses.
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
		execFileSync(
			'git',
			['ls-files', '-z', ...args, '--', 'crates', 'examples', 'tools', 'apps'],
			git,
		)
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

/** `a/b.rs` is `a::b`; a crate root is the empty path. */
function modulePath(relative: string): string[] {
	const parts = relative.replace(/\.rs$/, '').split('/');
	return parts.length === 1 && (parts[0] === 'lib' || parts[0] === 'main') ? [] : parts;
}

const definition =
	/^(?:pub(?:\([a-z ]+\))? )?(?:(?:const|async|unsafe) )*(?:fn|struct|enum|type|trait|const|static) ([A-Za-z_][A-Za-z0-9_]*)/gm;

/**
 * Top-level items that their own file never uses and that only modules below it use: each
 * belongs in the narrowest module that holds its users. Files map a path to its text.
 */
function misplacedItems(files: Map<string, string>): string[] {
	const code = new Map(
		[...files].map(([file, text]) => [
			file,
			text
				.split('\n')
				.filter((line) => !line.trimStart().startsWith('//'))
				.join('\n'),
		]),
	);
	const crates = new Map<string, [string, string[]][]>();
	for (const file of code.keys()) {
		const match = /^(.*?)\/src\/(.*\.rs)$/.exec(file);
		if (!match || file.includes('/src/bin/')) continue;
		const [, crate = '', relative = ''] = match;
		crates.set(crate, [...(crates.get(crate) ?? []), [file, modulePath(relative)]]);
	}
	const failures: string[] = [];
	for (const [crate, members] of crates) {
		const owners = new Map<string, string[]>();
		for (const [file] of members) {
			for (const [, name = ''] of (code.get(file) ?? '').matchAll(definition)) {
				owners.set(name, [...(owners.get(name) ?? []), file]);
			}
		}
		const paths = new Map(members);
		for (const [name, defined] of owners) {
			const own = defined[0];
			if (defined.length !== 1 || own === undefined || name.length < 3) continue;
			const word = new RegExp(`\\b${name}\\b`);
			if ((code.get(own)?.match(new RegExp(word, 'g'))?.length ?? 0) > 1) continue;
			const users = members
				.filter(([file]) => file !== own && word.test(code.get(file) ?? ''))
				.map(([, path]) => path);
			const ownPath = paths.get(own) ?? [];
			if (users.length === 0) continue;
			const below = users.every(
				(path) => path.length > ownPath.length && ownPath.every((part, i) => path[i] === part),
			);
			const branch = users[0]?.[ownPath.length];
			if (!below || !users.every((path) => path[ownPath.length] === branch)) continue;
			const external = [...code].some(
				([file, text]) =>
					!file.startsWith(`${crate}/src/`) && new RegExp(`\\b${name}\\b`).test(text),
			);
			if (!external) failures.push(`${own}: \`${name}\` is used only below it, in \`${branch}\``);
		}
	}
	return failures;
}

test('no item sits in a parent that only one child uses it from', () => {
	const files = rustFiles();
	const texts = new Map(files.map((file) => [file, readFileSync(resolve(root, file), 'utf8')]));
	assert.deepEqual(misplacedItems(texts), [], 'move these items into that child');
});

/** A crate whose root holds `parent` above two children. */
function tree(parent: string): Map<string, string> {
	return new Map([
		['c/src/lib.rs', `mod a;\nmod b;\n${parent}`],
		['c/src/a.rs', 'fn f() { helper(); shared(); }\n'],
		['c/src/b.rs', 'fn g() { shared(); }\n'],
	]);
}

test('the check finds an item that only one child uses and keeps a shared one', () => {
	assert.deepEqual(misplacedItems(tree('fn helper() {}\nfn shared() {}\n')), [
		'c/src/lib.rs: `helper` is used only below it, in `a`',
	]);
	assert.deepEqual(
		misplacedItems(tree('fn helper() {}\nfn shared() {}\nfn h() { helper(); }\n')),
		[],
	);
});
