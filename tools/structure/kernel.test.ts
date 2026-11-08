// The kernel's modules are layers: `crates/language_independent/kernel/src/lib.rs` lists them,
// and a module may use only the modules on earlier lines. This checks the list against the code.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const source = resolve(import.meta.dirname, '../../crates/language_independent/kernel/src');

/** Every file below `src/`, by its path relative to it. */
function read(): Map<string, string> {
	return new Map(
		readdirSync(source, { recursive: true, encoding: 'utf8' })
			.filter((file) => file.endsWith('.rs'))
			.map((file) => [file.replaceAll('\\', '/'), readFileSync(resolve(source, file), 'utf8')]),
	);
}

/** `a/b.rs` and `a/b/c.rs` are the modules `a::b` and `a::b::c`. */
function modulePath(file: string): string[] {
	return file.replace(/\.rs$/, '').split('/');
}

/** The layer list in `lib.rs`: unit (`a` or `a::b`) to its line number. */
function layers(lib: string): Map<string, number> {
	const ranks = new Map<string, number>();
	for (const line of lib.split('\n')) {
		const [, rank, units] = /^\/\/! (\d+)\. (.+)$/.exec(line) ?? [];
		if (rank === undefined || units === undefined) continue;
		for (const [, unit] of units.matchAll(/`([a-z_:]+)`/g)) {
			if (unit === undefined) continue;
			// A unit listed twice keeps no rank, so every use of it fails.
			ranks.set(unit, ranks.has(unit) ? Number.NaN : Number(rank));
		}
	}
	return ranks;
}

/** The longest unit that `path` is inside. */
function unitOf(path: string[], ranks: Map<string, number>): string | undefined {
	for (let length = path.length; length > 0; length--) {
		const unit = path.slice(0, length).join('::');
		if (ranks.has(unit)) return unit;
	}
	return undefined;
}

/** Code without comment lines, so doc links do not count as uses. */
function code(text: string): string {
	return text
		.split('\n')
		.filter((line) => !/^\s*\/\//.test(line))
		.join('\n');
}

function violations(files: Map<string, string>): { failures: string[]; uses: number } {
	const lib = files.get('lib.rs');
	if (lib === undefined) return { failures: ['lib.rs is missing'], uses: 0 };
	const ranks = layers(lib);
	const failures: string[] = [];
	if (ranks.size === 0) failures.push('lib.rs lists no layers');
	// A directory is a module too: its declarations sit inline in the parent.
	const modules = new Set(
		[...files.keys()].flatMap((file) =>
			modulePath(file).map((_, end, path) => path.slice(0, end + 1).join('::')),
		),
	);
	for (const [unit, rank] of ranks) {
		if (!modules.has(unit)) failures.push(`the layer list names \`${unit}\`, which is no module`);
		if (Number.isNaN(rank)) failures.push(`the layer list names \`${unit}\` twice`);
	}
	// `#[macro_export]` puts a macro at the crate root; it belongs to the layer of its file.
	const macros = new Map<string, string[]>();
	for (const [file, text] of files) {
		for (const [, name] of text.matchAll(/#\[macro_export\]\s*macro_rules!\s*([a-z_]+)/g)) {
			if (name !== undefined) macros.set(name, modulePath(file));
		}
	}
	let uses = 0;
	for (const [file, text] of files) {
		if (file === 'lib.rs') continue;
		const own = modulePath(file);
		const ownUnit = unitOf(own, ranks);
		const body = code(text);
		if (ownUnit === undefined) {
			failures.push(`${file}: in no layer of lib.rs`);
			continue;
		}
		if (/\bcrate::\{/.test(body)) failures.push(`${file}: write one path per \`use crate::\``);
		const targets: string[][] = [];
		for (const [, used = ''] of body.matchAll(
			/\bcrate::([a-z_][a-z0-9_]*(?:::[a-z_][a-z0-9_]*)*)/g,
		)) {
			const path = used.split('::');
			targets.push(macros.get(path[0] ?? '') ?? path);
		}
		for (const [, sibling = ''] of body.matchAll(/\bsuper::([a-z_][a-z0-9_]*)::[A-Za-z_]/g)) {
			const path = [...own.slice(0, -1), sibling];
			if (modules.has(path.join('::'))) targets.push(path);
		}
		for (const target of targets) {
			uses++;
			const targetUnit = unitOf(target, ranks);
			if (targetUnit === undefined) {
				failures.push(`${file}: uses \`${target.join('::')}\`, which is in no layer`);
			} else if (targetUnit !== ownUnit && ranks.get(targetUnit)! >= ranks.get(ownUnit)!) {
				failures.push(`${file}: \`${ownUnit}\` uses \`${targetUnit}\`, which is not below it`);
			}
		}
	}
	return { failures: [...new Set(failures)], uses };
}

function edited(file: string, edit: (text: string) => string): Map<string, string> {
	const files = read();
	const text = files.get(file);
	assert.ok(text !== undefined, `${file} exists`);
	files.set(file, edit(text));
	return files;
}

test('each kernel module uses only the layers before its own', () => {
	const { failures, uses } = violations(read());
	assert.deepEqual(failures, []);
	assert.ok(uses > 30, `the check saw ${uses} uses`);
});

test('the check rejects a use of a later layer, of the same layer, and of no layer', () => {
	const upward = edited(
		'source/positions.rs',
		(text) => `use crate::computation::task::TaskOutput;\n${text}`,
	);
	assert.deepEqual(violations(upward).failures, [
		'source/positions.rs: `source` uses `computation::task`, which is not below it',
	]);
	const sideways = edited(
		'diagnostics.rs',
		(text) => `use crate::output::emitter::Emitter;\n${text}`,
	);
	assert.deepEqual(violations(sideways).failures, [
		'diagnostics.rs: `diagnostics` uses `output`, which is not below it',
	]);
	const throughSuper = edited(
		'computation/database.rs',
		(text) => `use super::task::Task;\n${text}`,
	);
	assert.deepEqual(violations(throughSuper).failures, [
		'computation/database.rs: `computation::database` uses `computation::task`, which is not below it',
	]);
	const grouped = edited('task_files.rs', (text) => `use crate::{index, source};\n${text}`);
	assert.deepEqual(violations(grouped).failures, [
		'task_files.rs: write one path per `use crate::`',
	]);
});

test('the check rejects a module outside the list and a list entry without a module', () => {
	const files = read();
	files.set('extra.rs', 'pub fn f() {}\n');
	files.set(
		'lib.rs',
		files.get('lib.rs')!.replace('//! 8. `task_files`', '//! 8. `task_files`, `missing`'),
	);
	assert.deepEqual(violations(files).failures, [
		'the layer list names `missing`, which is no module',
		'extra.rs: in no layer of lib.rs',
	]);
	const twice = read();
	twice.set(
		'lib.rs',
		twice.get('lib.rs')!.replace('//! 8. `task_files`', '//! 8. `task_files`, `index`'),
	);
	assert.ok(violations(twice).failures.includes('the layer list names `index` twice'));
});

test('the check accepts a use of an earlier layer and a comment that names a later one', () => {
	const downward = edited(
		'task_files.rs',
		(text) => `use crate::performance::buffer_pool;\n// See crate::computation::pipeline.\n${text}`,
	);
	assert.deepEqual(violations(downward).failures, []);
});
