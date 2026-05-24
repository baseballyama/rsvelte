#!/usr/bin/env node
// Publish the platform packages that ship an executable `svelte-check`
// binary via `npm publish` rather than `pnpm publish`.
//
// Why: `pnpm pack` (which `pnpm publish` uses) normalises file modes to 0644,
// dropping the execute bit even when the source file has +x set. The
// resulting tarball ships a non-executable binary and `pnpm dlx
// @rsvelte/svelte-check` fails with EACCES. `npm pack` preserves modes, so
// publishing these tarballs with npm yields a working install.
//
// This runs *before* `changeset publish`; changesets sees the already-
// published versions and skips them, while every other workspace package
// continues to publish through changesets/pnpm.
//
// The Windows platform package ships `svelte-check.exe` and is excluded —
// Windows ignores POSIX mode bits, so pnpm's normalisation is harmless
// there.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const platformDirs = [
	'npm/svelte-check-darwin-arm64',
	'npm/svelte-check-darwin-x64',
	'npm/svelte-check-linux-x64-gnu',
	'npm/svelte-check-linux-arm64-gnu',
];

const dryRun = process.argv.includes('--dry-run');

function readPackageJson(dir) {
	const pkgPath = resolve(dir, 'package.json');
	return JSON.parse(readFileSync(pkgPath, 'utf8'));
}

function isAlreadyPublished(name, version) {
	const result = spawnSync('npm', ['view', `${name}@${version}`, 'version'], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	if (result.status === 0 && result.stdout.trim() === version) {
		return true;
	}
	// `npm view` exits non-zero ("404 Not Found") for missing versions. Treat
	// any other failure as not-yet-published; the subsequent `npm publish`
	// will surface real registry errors.
	return false;
}

let failures = 0;
for (const relDir of platformDirs) {
	const absDir = resolve(repoRoot, relDir);
	if (!existsSync(absDir)) {
		console.warn(`[publish-platform] skipping missing dir: ${relDir}`);
		continue;
	}
	const { name, version } = readPackageJson(absDir);
	if (isAlreadyPublished(name, version)) {
		console.log(`[publish-platform] ${name}@${version} already published — skipping`);
		continue;
	}
	console.log(`[publish-platform] publishing ${name}@${version}${dryRun ? ' (dry-run)' : ''}`);
	const args = ['publish', '--access', 'public'];
	if (dryRun) args.push('--dry-run');
	const result = spawnSync('npm', args, {
		cwd: absDir,
		stdio: 'inherit',
	});
	if (result.status !== 0) {
		console.error(`[publish-platform] FAILED: ${name}@${version} (exit ${result.status})`);
		failures += 1;
	}
}

if (failures > 0) {
	console.error(`[publish-platform] ${failures} platform package(s) failed to publish`);
	process.exit(1);
}
