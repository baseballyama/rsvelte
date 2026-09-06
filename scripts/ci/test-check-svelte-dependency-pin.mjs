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
// manifest never named. Match only non-peer declarations here. pnpm records an
// optional peer under an importer's `dependencies`, so a flat scan cannot tell
// that its range is intentionally exempt.
// pnpm 12 writes a two-document lockfile: `packageManagerDependencies` (pnpm's
// own binaries) first, the project second, `---` separated. Both documents carry
// an `importers:` with a `.:` under it, so reading the FIRST match finds pnpm's
// and reports the project's pin as absent. Read every document and require the
// specifier to be recorded and to agree wherever it appears, so the control is
// document-count agnostic without becoming permissive.
export function lockfileSpecifiers(lock, importer) {
	const escaped = importer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const block = new RegExp(`^  ${escaped}:\\n([\\s\\S]*?)(?=^  \\S|(?![\\s\\S]))`, 'm');
	const out = [];
	for (const document of lock.split(/^---$/m)) {
		const spec = document
			.match(block)?.[1]
			?.match(/^      svelte:\n        specifier: (.+)$/m)?.[1];
		if (spec !== undefined) out.push(spec);
	}
	return out;
}

check('every non-peer manifest pin is reflected in the lockfile', () => {
	const lock = readFileSync(join(ROOT, 'pnpm-lock.yaml'), 'utf8');
	const found = declarations(manifests());
	for (const declaration of found) {
		const importer = declaration.file === 'package.json' ? '.' : dirname(declaration.file);
		const specs = lockfileSpecifiers(lock, importer);
		assert.ok(specs.length > 0, `no lockfile importer records svelte for ${importer}`);
		for (const spec of specs) {
			assert.equal(spec, declaration.spec, `${declaration.file} is not reflected in pnpm-lock.yaml`);
		}
	}
});

// The shape #4364 arrived in: pnpm 12's own document first, the project second.
// Its `.:` also has a `specifier:` line, so a reader that stops at the first
// `.:` finds pnpm's block and reports the project's pin as missing.
const PNPM12_LOCKFILE = `---
lockfileVersion: '9.0'

importers:

  .:
    configDependencies: {}
    packageManagerDependencies:
      pnpm:
        specifier: 12.3.4
        version: 12.3.4

packages:

  '@pnpm/exe.darwin-arm64@12.3.4':
    resolution: {integrity: sha512-deadbeef==}

---
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true

importers:

  .:
    devDependencies:
      svelte:
        specifier: 5.56.10
        version: 5.56.10
`;

const PNPM11_LOCKFILE = `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true

importers:

  .:
    devDependencies:
      svelte:
        specifier: 5.56.10
        version: 5.56.10
`;

check('a two-document lockfile is read at the project document', () => {
	assert.deepEqual(lockfileSpecifiers(PNPM12_LOCKFILE, '.'), ['5.56.10']);
});

check('a one-document lockfile is unchanged', () => {
	assert.deepEqual(lockfileSpecifiers(PNPM11_LOCKFILE, '.'), ['5.56.10']);
});

// Reading every document must not become "accept if any document agrees".
check('a wrong specifier in the project document is still visible', () => {
	assert.deepEqual(
		lockfileSpecifiers(PNPM12_LOCKFILE.replace('specifier: 5.56.10', 'specifier: 5.56.4'), '.'),
		['5.56.4'],
	);
});

// The state that must stay a failure: a lockfile recording no svelte at all.
// Without this the `specs.length > 0` assertion could be dropped and every
// control above would still pass.
check('a lockfile that records no svelte yields nothing to compare', () => {
	assert.deepEqual(lockfileSpecifiers(PNPM12_LOCKFILE.split('---')[1], '.'), []);
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
