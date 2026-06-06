#!/usr/bin/env node
// One-shot MANUAL bootstrap publish for the @rsvelte/fmt package family.
//
// Why this exists: npm Trusted Publishing (OIDC) can't publish a package that
// doesn't exist yet — the registry only exposes the "Trusted Publisher"
// settings page once a package has at least one version. So the very first
// publish of these six brand-new packages has to be done manually, from a
// machine logged in to npm (`npm login`) with publish rights to the @rsvelte
// scope. After this runs once, configure a Trusted Publisher for each of the
// six packages on npmjs.com (repo + .github/workflows/release.yml); every
// later release then publishes automatically via CI/OIDC.
//
// What it does, in order:
//   1. The five platform packages (@rsvelte/fmt-<triple>) → `npm publish`.
//      npm preserves the executable bit on the staged binary; pnpm would
//      normalise it to 0644 and break `npx rsvelte-fmt` on POSIX.
//   2. The loader package (@rsvelte/fmt) → `pnpm publish`. It MUST be pnpm:
//      the loader's optionalDependencies use the `workspace:^` protocol, and
//      only pnpm rewrites that to a real version range on publish. A plain
//      `npm publish` would ship a literal `workspace:^` and break installs.
//
// Prerequisites:
//   - `npm login` (an account with @rsvelte publish access).
//   - The five platform binaries staged into apps/npm/fmt-<triple>/. Build
//     them via the release workflow's `build-rsvelte-fmt` matrix, download the
//     `rsvelte-fmt-<triple>` artifacts into ./artifacts, then:
//        FMT_ARTIFACT_ROOT=./artifacts pnpm run stage-fmt
//
// Usage:
//   node scripts/release/first-publish-fmt.mjs [--dry-run]
//
// NO --provenance is passed: provenance requires OIDC, which only exists in
// CI. This script is for the local, manual, one-time bootstrap only.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const dryRun = process.argv.includes('--dry-run');

// Platform packages ship a native binary and publish via npm (mode-preserving).
const platformPackages = [
	{ dir: 'apps/npm/fmt-darwin-arm64', binary: 'rsvelte-fmt' },
	{ dir: 'apps/npm/fmt-darwin-x64', binary: 'rsvelte-fmt' },
	{ dir: 'apps/npm/fmt-linux-x64-gnu', binary: 'rsvelte-fmt' },
	{ dir: 'apps/npm/fmt-linux-arm64-gnu', binary: 'rsvelte-fmt' },
	{ dir: 'apps/npm/fmt-win32-x64-msvc', binary: 'rsvelte-fmt.exe' },
];
// The loader package carries `workspace:^` deps and must publish via pnpm.
const loaderDir = 'apps/npm/fmt';

function readPkg(dir) {
	return JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8'));
}

function isLoggedIn() {
	const r = spawnSync('npm', ['whoami'], { encoding: 'utf8' });
	return r.status === 0 ? r.stdout.trim() : null;
}

function isAlreadyPublished(name, version) {
	const r = spawnSync('npm', ['view', `${name}@${version}`, 'version'], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	// `npm view` exits non-zero ("404") for a missing version; treat anything
	// other than an exact version match as not-yet-published.
	return r.status === 0 && r.stdout.trim() === version;
}

function publish(absDir, usePnpm) {
	const tool = usePnpm ? 'pnpm' : 'npm';
	const args = ['publish', '--access', 'public'];
	if (usePnpm) args.push('--no-git-checks');
	if (dryRun) args.push('--dry-run');
	const r = spawnSync(tool, args, { cwd: absDir, stdio: 'inherit' });
	return r.status === 0;
}

// ── Preflight ───────────────────────────────────────────────────────────
const who = isLoggedIn();
if (!who && !dryRun) {
	console.error('[first-publish] Not logged in to npm. Run `npm login` first.');
	process.exit(1);
}
console.log(`[first-publish] npm user: ${who ?? '(none — dry run)'}`);

// Every platform binary must be staged before we publish anything.
let missingBinaries = 0;
for (const { dir, binary } of platformPackages) {
	const binPath = resolve(repoRoot, dir, binary);
	if (!existsSync(binPath)) {
		console.error(`[first-publish] missing staged binary: ${dir}/${binary}`);
		missingBinaries += 1;
	}
}
if (missingBinaries > 0) {
	console.error(
		`[first-publish] ${missingBinaries} binary(ies) not staged. Download the\n` +
			`  build-rsvelte-fmt artifacts into ./artifacts and run:\n` +
			`    FMT_ARTIFACT_ROOT=./artifacts pnpm run stage-fmt`,
	);
	process.exit(1);
}

// ── Publish platform packages (npm), then the loader (pnpm) ───────────────
let failures = 0;
const order = [
	...platformPackages.map((p) => ({ dir: p.dir, usePnpm: false })),
	{ dir: loaderDir, usePnpm: true },
];

for (const { dir, usePnpm } of order) {
	const absDir = resolve(repoRoot, dir);
	const { name, version } = readPkg(absDir);
	if (isAlreadyPublished(name, version)) {
		console.log(`[first-publish] ${name}@${version} already published — skipping`);
		continue;
	}
	console.log(
		`[first-publish] publishing ${name}@${version} via ${usePnpm ? 'pnpm' : 'npm'}${dryRun ? ' (dry-run)' : ''}`,
	);
	if (!publish(absDir, usePnpm)) {
		console.error(`[first-publish] FAILED: ${name}@${version}`);
		failures += 1;
	}
}

if (failures > 0) {
	console.error(`[first-publish] ${failures} package(s) failed to publish`);
	process.exit(1);
}

console.log(
	'\n[first-publish] Done. Next: configure a Trusted Publisher for each of the\n' +
		'six @rsvelte/fmt* packages on npmjs.com (repo + .github/workflows/release.yml).\n' +
		'After that, future releases publish automatically via CI/OIDC.',
);
