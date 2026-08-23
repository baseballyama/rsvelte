#!/usr/bin/env node
// Controls for check-core-consumer-changesets.mjs.
//
// That guard exists because several Rust crates compile into npm artifacts with
// no dependency edge between them, so Changesets cannot cascade a fix from one
// to another. Its own header says so — and `crates/rsvelte_napi` was still
// missing from its table, so a changeset naming `@rsvelte/compiler` would have
// republished wasm that did not contain the change while the package that did
// stayed on a stale build (#3665).
//
// A guard whose coverage is a hand-maintained list needs a control on the LIST,
// not only on the lookup. `uncoveredFixedGroups` is that control: every
// independently-published artifact family in `.changeset/config.json` must be
// named by some rule, or nobody has decided about it.

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RULES, uncoveredFixedGroups } from './check-core-consumer-changesets.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const CONFIG = JSON.parse(readFileSync(join(ROOT, '.changeset/config.json'), 'utf8'));

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

check('every fixed group in .changeset/config.json is named by some rule', () => {
	const uncovered = uncoveredFixedGroups(CONFIG);
	assert.deepEqual(
		uncovered.map((g) => g[0]),
		[],
		'these artifact families map from no source path',
	);
});

// The control: the check must be able to say "no". A group nobody named is
// exactly the state rsvelte_napi's was in.
check('a fixed group nobody names is reported', () => {
	const invented = { fixed: [...CONFIG.fixed, ['@rsvelte/nobody-owns-this']] };
	const uncovered = uncoveredFixedGroups(invented);
	assert.equal(uncovered.length, 1, JSON.stringify(uncovered));
	assert.deepEqual(uncovered[0], ['@rsvelte/nobody-owns-this']);
});

// A crate that ships in exactly one artifact family must map to that family and
// nothing else; naming a second package would force an unrelated republish.
const SOLE_ARTIFACT = {
	'crates/rsvelte_napi/src/': '@rsvelte/vite-plugin-svelte-native',
	'crates/rsvelte_check/src/': '@rsvelte/svelte-check',
	'crates/rsvelte_fmt/src/': '@rsvelte/fmt',
	'crates/rsvelte_language_server/src/': '@rsvelte/language-server',
};

for (const [prefix, pkg] of Object.entries(SOLE_ARTIFACT)) {
	check(`${prefix} requires exactly ${pkg}`, () => {
		const rule = RULES.find((r) => r.prefix === prefix);
		assert.ok(rule, `no rule for ${prefix}`);
		assert.deepEqual(rule.requires, [pkg]);
	});
}

// Every package a rule names must be a real workspace package, or the
// requirement can never be satisfied. Fixed-group membership is NOT the test:
// `@rsvelte/svelte2tsx` is in no group and is correct there, because it depends
// on `@rsvelte/compiler` and receives the cascade that way.
check('every required package is a real workspace package', () => {
	const published = new Set(
		readdirSync(join(ROOT, 'apps/npm'))
			.map((dir) => join(ROOT, 'apps/npm', dir, 'package.json'))
			.filter(existsSync)
			.map((file) => JSON.parse(readFileSync(file, 'utf8')).name),
	);
	const unknown = [...new Set(RULES.flatMap((r) => r.requires))].filter((p) => !published.has(p));
	assert.deepEqual(unknown, [], 'required by a rule but not a workspace package');
});

check('changeset.yml still runs the guard', () => {
	const yml = readFileSync(join(ROOT, '.github/workflows/changeset.yml'), 'utf8');
	assert.ok(
		yml.includes('scripts/release/check-core-consumer-changesets.mjs'),
		'changeset.yml no longer runs the guard',
	);
});

console.log(
	failures === 0
		? '\ncore-consumer-changesets self-test: all checks passed'
		: `\ncore-consumer-changesets self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
