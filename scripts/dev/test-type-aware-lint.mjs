#!/usr/bin/env node
// Run the type-aware lint suite (crates/rsvelte_lint_types).
//
// That crate is its own Cargo workspace (it path-depends on the PRIVATE
// submodules/corsa-bind), so `cargo test` at the repo root never touches it and
// the main CI shards never build it. This script is the single documented way
// to run it: it checks out the submodules it needs, materializes an API-capable
// tsgo binary, and shells into the crate's workspace.
//
// The tests hard-fail when the binary is missing (issue #1790), so a broken
// setup here is loud rather than a green no-op.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const crateDir = join(repoRoot, 'crates/rsvelte_lint_types');
// Kept out of the pnpm-managed root node_modules so npm and pnpm never fight
// over the same tree.
const tsgoPrefix = join(repoRoot, '.cache/type-aware-lint');

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

// corsa-bind is private; without access the crate cannot even be compiled.
ensureSubmodule(
	'submodules/corsa-bind',
	'submodules/corsa-bind is a private repository (ubugeeei-prod/corsa-bind).\n' +
		'The type-aware lint backend cannot be built without read access to it.'
);
// The typed no-unused-props oracle replays upstream fixtures from here.
ensureSubmodule('submodules/eslint-plugin-svelte', 'Check your network / git configuration.');

// An explicit override wins; otherwise install @typescript/native-preview, the
// acquisition path corsa-bind itself documents (`defaultCorsaExecutable`).
let executable = process.env.CORSA_EXECUTABLE ?? process.env.CORSA_PATH;
if (!executable) {
	executable = nativePreviewBinary(tsgoPrefix);
	if (!executable) {
		console.log('==> installing @typescript/native-preview');
		run('npm', [
			'install',
			'--prefix',
			tsgoPrefix,
			'--no-save',
			'--no-package-lock',
			'@typescript/native-preview'
		]);
		executable = nativePreviewBinary(tsgoPrefix);
	}
}
if (!executable) {
	console.error('Could not locate a tsgo binary after installing @typescript/native-preview.');
	process.exit(1);
}
console.log(`==> tsgo: ${executable}`);
// Sanity-check the binary before handing it to the tests, so "wrong binary"
// reads as a setup error here rather than a confusing session-spawn failure.
try {
	execFileSync(executable, ['--version'], { stdio: 'pipe' });
} catch (err) {
	console.error(`tsgo binary at ${executable} is not runnable: ${err.message}`);
	process.exit(1);
}

run('cargo', ['test', ...process.argv.slice(2)], {
	cwd: crateDir,
	env: { ...process.env, CORSA_EXECUTABLE: executable }
});
