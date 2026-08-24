#!/usr/bin/env node
// Controls for check-svelte-dependency-pin.mjs.
//
// The guard passes on the tree it was written against, which proves nothing on
// its own — before #3589 the root manifest read `^5.56.9` and the lockfile
// resolved 5.56.10, and nothing anywhere reported it.

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { declarations, manifests } from './check-svelte-dependency-pin.mjs';

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

/** A synthetic workspace: root manifest plus one package under apps/npm. */
function workspace(root, pkg) {
	const dir = mkdtempSync(join(tmpdir(), 'svelte-pin-'));
	writeFileSync(join(dir, 'package.json'), JSON.stringify(root));
	if (pkg) {
		mkdirSync(join(dir, 'apps', 'npm', 'p'), { recursive: true });
		writeFileSync(join(dir, 'apps', 'npm', 'p', 'package.json'), JSON.stringify(pkg));
	}
	return dir;
}

function run(dir) {
	try {
		return declarations(manifests(dir), dir);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

check('an exact version is accepted', () => {
	const found = run(workspace({ devDependencies: { svelte: '5.56.10' } }));
	assert.equal(found.length, 1);
	assert.equal(found[0].exact, true);
});

// The state the tree was actually in.
check('a caret range is rejected', () => {
	const found = run(workspace({ devDependencies: { svelte: '^5.56.9' } }));
	assert.equal(found.length, 1);
	assert.equal(found[0].exact, false);
});

for (const spec of ['~5.56.9', '>=5.56.9', '5.x', '*', 'latest', '5.56.9 || 5.57.0']) {
	check(`\`${spec}\` is rejected`, () => {
		const found = run(workspace({ devDependencies: { svelte: spec } }));
		assert.equal(found[0].exact, false, spec);
	});
}

// A prerelease is still a single version, so it must stay acceptable — this is
// the near-miss the caret rule must not sweep up.
check('a prerelease version is accepted', () => {
	const found = run(workspace({ devDependencies: { svelte: '5.57.0-next.1' } }));
	assert.equal(found[0].exact, true);
});

check('a peerDependency range is not inspected', () => {
	const found = run(
		workspace({ devDependencies: { svelte: '5.56.10' } }, { peerDependencies: { svelte: '^5.0.0' } }),
	);
	assert.deepEqual(
		found.map((d) => d.field),
		['devDependencies'],
		'peerDependencies must be exempt — a pinned peer is uninstallable',
	);
});

check('a workspace package is inspected too', () => {
	const found = run(
		workspace({ devDependencies: { svelte: '5.56.10' } }, { devDependencies: { svelte: '^5.56.4' } }),
	);
	assert.equal(found.length, 2);
	assert.equal(found.filter((d) => !d.exact).length, 1);
});

// The lockfile is where the range actually bit: it resolved to a version the
// manifest never named.
check('every lockfile specifier for svelte is exact', () => {
	const lock = readFileSync(join(ROOT, 'pnpm-lock.yaml'), 'utf8');
	const specs = [...lock.matchAll(/^      svelte:\n        specifier: (.+)$/gm)].map((m) => m[1]);
	assert.ok(specs.length > 0, 'no svelte importer entry found in pnpm-lock.yaml');
	assert.deepEqual(
		specs.filter((s) => !/^\d+\.\d+\.\d+/.test(s)),
		[],
		'pnpm-lock.yaml records a range specifier for svelte',
	);
});

check('ci.yml runs the guard and this control', () => {
	const yml = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8');
	assert.ok(yml.includes('scripts/ci/check-svelte-dependency-pin.mjs'), 'guard not wired');
	assert.ok(yml.includes('scripts/ci/test-check-svelte-dependency-pin.mjs'), 'control not wired');
});

console.log(
	failures === 0
		? '\nsvelte-dependency-pin self-test: all checks passed'
		: `\nsvelte-dependency-pin self-test: ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
