#!/usr/bin/env node
// Run the type-aware lint suite (crates/rsvelte_lint_types).
//
// That crate is its own Cargo workspace (it path-depends on
// submodules/corsa-bind, a heavy build nobody else needs), so `cargo test` at
// the repo root never touches it and the main CI shards never build it. This
// script is the single documented way to run it: it checks out the submodules
// it needs, materializes an API-capable tsgo binary, and shells into the
// crate's workspace.
//
// The tests hard-fail when the binary is missing (issue #1790), so a broken
// setup here is loud rather than a green no-op.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const crateDir = join(repoRoot, 'crates/rsvelte_lint_types');
// Its own package.json pins the tsgo version (see that file). Outside the pnpm
// workspace globs, so npm and pnpm never fight over the same tree.
const tsgoPrefix = join(repoRoot, 'scripts/dev/type-aware-lint');

function run(cmd, args, opts = {}) {
	const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: repoRoot, ...opts });
	if (r.status !== 0) {
		console.error(`\n${cmd} ${args.join(' ')} failed (exit ${r.status ?? 'signal'})`);
		process.exit(r.status ?? 1);
	}
}

function ensureSubmodule(path, hint) {
	if (existsSync(join(repoRoot, path, '.git'))) return;
	console.log(`==> checking out ${path}`);
	const r = spawnSync('git', ['submodule', 'update', '--init', '--depth', '1', path], {
		stdio: 'inherit',
		cwd: repoRoot
	});
	if (r.status !== 0) {
		console.error(`\nCould not check out ${path}.\n${hint}`);
		process.exit(1);
	}
}

/** Locate the tsgo binary inside an `@typescript/native-preview*` install. */
function nativePreviewBinary(prefix) {
	const scope = join(prefix, 'node_modules/@typescript');
	if (!existsSync(scope)) return undefined;
	for (const entry of readdirSync(scope)) {
		if (!entry.startsWith('native-preview-')) continue;
		for (const rel of ['lib/tsgo', 'lib/tsgo.exe', 'bin/tsgo', 'bin/tsgo.exe']) {
			const p = join(scope, entry, rel);
			if (existsSync(p)) return p;
		}
	}
	const wrapper = join(scope, 'native-preview/bin/tsgo.js');
	return existsSync(wrapper) ? wrapper : undefined;
}

// Both public — no credentials involved.
ensureSubmodule('submodules/corsa-bind', 'Check your network / git configuration.');
// The typed no-unused-props oracle replays upstream fixtures from here.
ensureSubmodule('submodules/eslint-plugin-svelte', 'Check your network / git configuration.');

// An explicit override wins; otherwise install the pinned
// @typescript/native-preview, the acquisition path corsa-bind itself documents
// (`defaultCorsaExecutable`).
let executable = process.env.CORSA_EXECUTABLE ?? process.env.CORSA_PATH;
if (!executable) {
	// Always attempt the install rather than short-circuiting on "a binary
	// exists": after a Renovate bump the existing tree is the OLD version, and a
	// stale tsgo silently changes diagnostic text. `--prefer-offline` keeps it
	// cheap (and working offline) once the pinned tarball is in the npm cache.
	console.log('==> installing @typescript/native-preview (pinned)');
	const install = spawnSync(
		'npm',
		['install', '--prefix', tsgoPrefix, '--no-package-lock', '--prefer-offline'],
		{ stdio: 'inherit', cwd: repoRoot }
	);
	executable = nativePreviewBinary(tsgoPrefix);
	if (install.status !== 0) {
		// Offline with nothing cached is fatal; offline with a previous install is
		// not — fall back, and let the version check below flag a stale binary.
		if (!executable) {
			console.error('\nnpm install failed and no previously installed tsgo binary was found.');
			process.exit(install.status ?? 1);
		}
		console.warn('\nwarning: npm install failed — falling back to the installed binary.');
	}
}
if (!executable) {
	console.error('Could not locate a tsgo binary after installing @typescript/native-preview.');
	process.exit(1);
}
// Sanity-check the binary before handing it to the tests, so "wrong binary"
// reads as a setup error here rather than a confusing session-spawn failure.
let version;
try {
	version = execFileSync(executable, ['--version'], { encoding: 'utf8' }).trim();
} catch (err) {
	console.error(`tsgo binary at ${executable} is not runnable: ${err.message}`);
	process.exit(1);
}
// Printed because the suite asserts exact diagnostic text — when a run diverges,
// the tsgo build is the first thing to check.
console.log(`==> tsgo: ${executable}\n==> ${version}`);
// A binary that does not match the pin is the single most likely cause of a
// mysterious diagnostic-text failure, so say so out loud rather than let it
// look like a code regression.
const pinned = JSON.parse(readFileSync(join(tsgoPrefix, 'package.json'), 'utf8')).dependencies[
	'@typescript/native-preview'
];
if (!version.includes(pinned)) {
	console.warn(
		`warning: tsgo reports "${version}" but the pin is ${pinned}. ` +
			'Diagnostic text may differ from what the tests expect.'
	);
}

run('cargo', ['test', ...process.argv.slice(2)], {
	cwd: crateDir,
	env: { ...process.env, CORSA_EXECUTABLE: executable }
});
