#!/usr/bin/env node
// Controls for check-submodule-update-strategy.mjs.
//
// The guard passes on the tree it was written against, which proves nothing:
// before #4580 every entry lacked `update = none` and no job anywhere went red,
// because the only thing that reads the strategy is a downstream `cargo fetch`.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SELF, entries, isUnguardedCall, parseGrep } from './check-submodule-update-strategy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

let failures = 0;

function check(name, fn) {
	try {
		fn();
		console.log(`  ok   ${name}`);
	} catch (err) {
		failures += 1;
		console.log(`  FAIL ${name}\n       ${err.message}`);
	}
}

const GITMODULES = `[submodule "svelte"]
	path = submodules/svelte
	url = https://github.com/sveltejs/svelte.git
	ignore = dirty
	update = none

[submodule "submodules/vize"]
	path = submodules/vize
	url = git@github.com:ubugeeei-prod/vize.git
	update = none
`;

check('every entry is read with its path and strategy', () => {
	const found = entries(GITMODULES);
	assert.deepEqual(
		found.map((e) => [e.name, e.path, e.update]),
		[
			['svelte', 'submodules/svelte', 'none'],
			['submodules/vize', 'submodules/vize', 'none'],
		],
	);
});

// The state the PR shipped in: 118 of 119 entries marked, the first one not.
check('an entry without a strategy is visible', () => {
	const found = entries(GITMODULES.replace('\tignore = dirty\n\tupdate = none', '\tignore = dirty'));
	assert.deepEqual(
		found.filter((e) => e.update !== 'none').map((e) => e.name),
		['svelte'],
	);
});

// A section whose settings are read into the previous entry would report the
// file as clean while one entry carries two strategies and another none.
check('a setting is attributed to its own section', () => {
	const found = entries(GITMODULES);
	assert.equal(found.length, 2);
	assert.equal(found[1].path, 'submodules/vize');
});

check('a comment mentioning the setting is not an entry', () => {
	const found = entries('# Every submodule is marked `update = none`.\n' + GITMODULES);
	assert.equal(found.length, 2);
});

for (const [text, unguarded] of [
	['git submodule update --init --depth 1 submodules/svelte', true],
	['git submodule update --init --recursive', true],
	['run: git submodule update --init --force --recursive', true],
	['"Svelte submodule missing — run `git submodule update --init`"', true],
	['git submodule update --init --checkout --depth 1 submodules/svelte', false],
	['git submodule update --init --checkout --recursive', false],
	['git submodule update --checkout --init submodules/svelte', false],
	// `--remote --merge` overrides the strategy the same way; it is not an init.
	['git submodule update --remote --merge "$TARGET_PATH"', false],
	// Prose about the flag, not a call. Backticks are not whitespace, so a
	// `(^|\s)--checkout` rule read these as unguarded calls — which is what this
	// guard's own comments tripped on before the scan reached them (they were
	// still untracked, so `git grep` could not see them and the run was green).
	['every `git submodule update --init` in the tree passes `--checkout`', false],
	['Does this line invoke `git submodule update --init` without `--checkout`?', false],
	['`--checkout` is required because every entry is `update = none`', false],
	// The argv form, as check-lint-types-lock.mjs shipped it after #4580.
	["['submodule', 'update', '--init', '--depth', '1', 'submodules/corsa-bind'],", true],
	["spawnSync('git', [\"submodule\", \"update\", \"--init\", path], {", true],
	["['submodule', 'update', '--init', '--checkout', '--depth', '1', dir],", false],
	["['submodule', 'status', '--', path]", false],
]) {
	check(`${unguarded ? 'flagged' : 'accepted'}: ${text.slice(0, 56)}`, () => {
		assert.equal(isUnguardedCall(text), unguarded);
	});
}

// `--init` must match the flag, not a longer word containing it.
check('a word containing "init" is not the flag', () => {
	assert.equal(isUnguardedCall('git submodule update --initialize-only'), false);
});

check('grep output is split at the line number, not at every colon', () => {
	const parsed = parseGrep('a/b.yml:12:  run: git submodule update --init --checkout x\n');
	assert.deepEqual(parsed, [
		{ file: 'a/b.yml', line: 12, text: '  run: git submodule update --init --checkout x' },
	]);
});

// The two halves of the invariant, asserted against the real artifacts rather
// than against the guard's own verdict.
check('.gitmodules marks every entry', () => {
	const found = entries(readFileSync(join(ROOT, '.gitmodules'), 'utf8'));
	assert.ok(found.length > 100, `only ${found.length} entries parsed`);
	assert.deepEqual(
		found.filter((e) => e.update !== 'none').map((e) => e.name),
		[],
	);
});

// The exclusion exists because these two files hold the command as data. It has
// to stay exactly those two: a third entry would be a real call site silenced.
check('only this guard and its controls are exempt from the scan', () => {
	assert.deepEqual(SELF, [
		'scripts/ci/check-submodule-update-strategy.mjs',
		'scripts/ci/test-check-submodule-update-strategy.mjs',
	]);
});

// Both exempt files must still be the kind of file the exemption claims: they
// describe the command, they never run it.
check('neither exempt file executes a submodule command', () => {
	for (const file of SELF) {
		const text = readFileSync(join(ROOT, file), 'utf8');
		assert.equal(
			/execFileSync\(\s*'git',\s*\[\s*'submodule'/.test(text),
			false,
			`${file} runs git submodule`,
		);
	}
});

check('ci.yml runs the guard and this control', () => {
	const yml = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8');
	assert.ok(yml.includes('scripts/ci/check-submodule-update-strategy.mjs'), 'guard not wired');
	assert.ok(yml.includes('scripts/ci/test-check-submodule-update-strategy.mjs'), 'control not wired');
});

console.log(
	failures === 0
		? '\nsubmodule-update-strategy self-test: all checks passed'
		: `\nsubmodule-update-strategy self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
