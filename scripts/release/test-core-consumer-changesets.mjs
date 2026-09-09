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

import { RULES, packagesIn, uncoveredFixedGroups } from './check-core-consumer-changesets.mjs';

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

// `rsvelte_formatter` is the one crate whose dependents publish into MORE than
// one fixed group, so its `requires` is derived from the dependency graph rather
// than transcribed: a fourth dependent, or a dependent moving group, has to fail
// here rather than silently leave one artifact shipping a stale formatter.
const CRATE_ARTIFACT = {
	rsvelte_fmt: '@rsvelte/fmt',
	rsvelte_language_server: '@rsvelte/language-server',
	rsvelte_fmt_wasm: null, // published nowhere — absent from release.yml's matrix
};

check('crates/rsvelte_formatter/src/ requires one package per publishing dependent', () => {
	const dependents = readdirSync(join(ROOT, 'crates'))
		.filter((dir) => dir !== 'rsvelte_formatter')
		.filter((dir) => {
			const manifest = join(ROOT, 'crates', dir, 'Cargo.toml');
			return existsSync(manifest) && readFileSync(manifest, 'utf8').includes('rsvelte_formatter');
		});
	assert.ok(dependents.length > 0, 'no dependent found — the scan is broken, not the table');
	const unmapped = dependents.filter((d) => !(d in CRATE_ARTIFACT));
	assert.deepEqual(unmapped, [], 'a new rsvelte_formatter dependent: map it, then extend the rule');
	const expected = [...new Set(dependents.map((d) => CRATE_ARTIFACT[d]).filter(Boolean))].sort();
	const rule = RULES.find((r) => r.prefix === 'crates/rsvelte_formatter/src/');
	assert.ok(rule, 'no rule for crates/rsvelte_formatter/src/');
	assert.deepEqual([...rule.requires].sort(), expected);
});

// The rule is only load-bearing while its packages sit in different fixed groups:
// two packages in one group cascade, and naming both would be noise.
check('the formatter rule names packages in distinct fixed groups', () => {
	const rule = RULES.find((r) => r.prefix === 'crates/rsvelte_formatter/src/');
	const groupOf = (pkg) => CONFIG.fixed.findIndex((group) => group.includes(pkg));
	const groups = rule.requires.map(groupOf);
	assert.ok(!groups.includes(-1), 'a required package is in no fixed group');
	assert.equal(new Set(groups).size, groups.length, 'two required packages share a fixed group');
});

// The wasm dependent is exempt because it has no artifact. That is a fact about
// release.yml, not a preference, so it is asserted rather than commented.
check('rsvelte_fmt_wasm publishes nothing', () => {
	const yml = readFileSync(join(ROOT, '.github/workflows/release.yml'), 'utf8');
	assert.ok(!yml.includes('rsvelte_fmt_wasm'), 'rsvelte_fmt_wasm is in release.yml now — it needs a rule');
});

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

// A reader that accepts only one quote style returns a plausible EMPTY set
// rather than an error, so it reads as "this changeset names nothing" (#4486).
// Both spellings occur in this repository, so both are pinned here.
check('packagesIn reads every quote style the repository uses', () => {
	const one = packagesIn("---\n'@rsvelte/language-server': patch\n---\nbody\n");
	assert.deepEqual([...one], ['@rsvelte/language-server'], 'single-quoted');
	const two = packagesIn('---\n"@rsvelte/compiler": patch\n---\nbody\n');
	assert.deepEqual([...two], ['@rsvelte/compiler'], 'double-quoted');
	const bare = packagesIn('---\n@rsvelte/fmt: patch\n---\nbody\n');
	assert.deepEqual([...bare], ['@rsvelte/fmt'], 'unquoted');
});

// The negative half. Without it the test above is satisfied by a reader that
// returns every @-looking token it can find anywhere in the file.
check('packagesIn reads the frontmatter only', () => {
	assert.deepEqual([...packagesIn('no frontmatter here\n@rsvelte/compiler: patch\n')], []);
	assert.deepEqual(
		// The body line must itself look like a frontmatter entry. With prose there,
		// a reader that scans the whole file passes anyway, because the regex anchors at ^.
		[...packagesIn("---\n'@rsvelte/compiler': patch\n---\n@rsvelte/fmt: patch\n")],
		['@rsvelte/compiler'],
	);
});

// A live control on the tree: the guard's verdict is computed from these files,
// so a reader that silently matches none of them would make every requirement
// look unmet -- or, with the tick logic, every one look borrowed.
check('every pending changeset names at least one @rsvelte package', () => {
	const dir = join(ROOT, '.changeset');
	const files = readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md');
	assert.ok(files.length > 0, 'no pending changesets -- this control cannot fire');
	const silent = files.filter((f) => packagesIn(readFileSync(join(dir, f), 'utf8')).size === 0);
	assert.deepEqual(silent, [], 'these changesets parse to no package');
});

console.log(
	failures === 0
		? '\ncore-consumer-changesets self-test: all checks passed'
		: `\ncore-consumer-changesets self-test: ${failures} failure(s)`,
);

process.exit(failures === 0 ? 0 : 1);
