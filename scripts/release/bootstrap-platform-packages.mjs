#!/usr/bin/env node
// One-shot manual publish for platform packages whose *name* does not yet
// exist on the registry.
//
// Why this exists: the release workflow publishes through npm OIDC trusted
// publishing, and a trusted publisher can only be configured for a package
// that already exists. The very first version of a brand-new platform package
// therefore fails with `404 Not Found - PUT` (release run 31025504084: the
// five `@rsvelte/language-server-*` packages added by #2272), which aborts
// `publish-platform-binaries.mjs` before `changeset publish` ever runs and
// leaves the release half-shipped.
//
// This script closes that gap once per new package name, from a maintainer's
// machine with a classic/granular npm token that may create packages:
//
//   1. pulls each platform binary from the artifacts of a completed CI run
//      (they cannot all be cross-built locally),
//   2. stages it into `apps/npm/<pkg>/` exactly like
//      `stage-language-server-binaries.mjs` does, preserving the +x bit,
//   3. publishes with plain `npm publish` — no `--provenance`, which requires
//      the OIDC token this path exists to work around.
//
// Afterwards, attach the trusted publisher to each new package on npmjs.com
// and re-run the release: `publish-platform-binaries.mjs` skips versions that
// are already published, so a re-run is idempotent.
//
// Usage:
//   node scripts/release/bootstrap-platform-packages.mjs --run <run-id>
//   node scripts/release/bootstrap-platform-packages.mjs --run <run-id> --yes
//
// Without `--yes` it stages and runs `npm publish --dry-run`, printing exactly
// what would be published. Publishing is irreversible — npm does not allow
// unpublishing a version after 72 hours — so the real publish is opt-in.

import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

// Each entry maps a workspace package directory to the CI artifact that holds
// its binary. Artifact names mirror the `upload-artifact` names in
// `.github/workflows/release.yml`.
const GROUPS = {
	'language-server': [
		{ dir: 'apps/npm/language-server-darwin-arm64', artifact: 'rsvelte-language-server-darwin-arm64', binary: 'rsvelte-language-server' },
		{ dir: 'apps/npm/language-server-darwin-x64', artifact: 'rsvelte-language-server-darwin-x64', binary: 'rsvelte-language-server' },
		{ dir: 'apps/npm/language-server-linux-x64-gnu', artifact: 'rsvelte-language-server-linux-x64-gnu', binary: 'rsvelte-language-server' },
		{ dir: 'apps/npm/language-server-linux-arm64-gnu', artifact: 'rsvelte-language-server-linux-arm64-gnu', binary: 'rsvelte-language-server' },
		{ dir: 'apps/npm/language-server-win32-x64-msvc', artifact: 'rsvelte-language-server-win32-x64-msvc', binary: 'rsvelte-language-server.exe' },
	],
};

const argv = process.argv.slice(2);

function flag(name) {
	return argv.includes(`--${name}`);
}

function option(name) {
	const i = argv.indexOf(`--${name}`);
	if (i === -1) return undefined;
	const value = argv[i + 1];
	if (value === undefined || value.startsWith('--')) {
		fail(`--${name} requires a value`);
	}
	return value;
}

function fail(message) {
	console.error(`[bootstrap] ${message}`);
	process.exit(1);
}

const runId = option('run');
const groupName = option('group') ?? 'language-server';
const publishForReal = flag('yes');
const otp = option('otp');

if (flag('help') || !runId) {
	console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).join('\n'));
	process.exit(runId ? 0 : 1);
}

const targets = GROUPS[groupName];
if (!targets) {
	fail(`unknown --group "${groupName}" (known: ${Object.keys(GROUPS).join(', ')})`);
}

function run(command, args, options = {}) {
	return spawnSync(command, args, { encoding: 'utf8', ...options });
}

function requireTool(command, args) {
	const result = run(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
	if (result.error || result.status !== 0) {
		fail(`\`${command} ${args.join(' ')}\` failed — is ${command} installed and authenticated?`);
	}
	return result.stdout.trim();
}

function isAlreadyPublished(name, version) {
	const result = run('npm', ['view', `${name}@${version}`, 'version'], { stdio: ['ignore', 'pipe', 'pipe'] });
	return result.status === 0 && result.stdout.trim() === version;
}

requireTool('gh', ['auth', 'status']);
// Only the real publish needs an npm session; a dry run must stay runnable
// (and reviewable) without one.
if (publishForReal) {
	console.log(`[bootstrap] npm user: ${requireTool('npm', ['whoami'])}`);
}
console.log(`[bootstrap] source run: ${runId}`);
console.log(`[bootstrap] mode: ${publishForReal ? 'PUBLISH' : 'dry-run (pass --yes to publish)'}`);

// Refuse to bootstrap a package that already exists: this script publishes
// without provenance, so using it on an established package would silently
// downgrade that version's supply-chain metadata compared with every other
// version of the same package.
const plan = [];
for (const target of targets) {
	const absDir = resolve(repoRoot, target.dir);
	if (!existsSync(absDir)) fail(`missing package directory: ${target.dir}`);
	const { name, version } = JSON.parse(readFileSync(join(absDir, 'package.json'), 'utf8'));
	if (isAlreadyPublished(name, version)) {
		console.log(`[bootstrap] ${name}@${version} already published — skipping`);
		continue;
	}
	const exists = run('npm', ['view', name, 'name'], { stdio: ['ignore', 'pipe', 'pipe'] }).status === 0;
	if (exists) {
		fail(
			`${name} already exists on the registry — do not bootstrap it. ` +
				`Publish it from CI so the tarball keeps its provenance attestation.`,
		);
	}
	plan.push({ ...target, absDir, name, version });
}

if (plan.length === 0) {
	console.log('[bootstrap] nothing to do — every package in this group is published.');
	process.exit(0);
}

const staging = mkdtempSync(join(tmpdir(), 'rsvelte-bootstrap-'));
let failures = 0;
try {
	for (const target of plan) {
		const dest = join(staging, target.artifact);
		const download = run('gh', ['run', 'download', runId, '--repo', 'baseballyama/rsvelte', '-n', target.artifact, '-D', dest], {
			stdio: 'inherit',
		});
		if (download.status !== 0) {
			fail(`failed to download artifact "${target.artifact}" from run ${runId} (expired?)`);
		}
		const src = join(dest, target.binary);
		if (!existsSync(src)) fail(`artifact "${target.artifact}" does not contain ${target.binary}`);
		const staged = join(target.absDir, target.binary);
		copyFileSync(src, staged);
		if (!target.binary.endsWith('.exe')) chmodSync(staged, 0o755);
		console.log(`[bootstrap] staged ${target.dir}/${target.binary} (${statSync(staged).size} bytes)`);
	}

	for (const target of plan) {
		console.log(`[bootstrap] publishing ${target.name}@${target.version}${publishForReal ? '' : ' (dry-run)'}`);
		const args = ['publish', '--access', 'public'];
		if (!publishForReal) args.push('--dry-run');
		if (otp) args.push('--otp', otp);
		const result = run('npm', args, { cwd: target.absDir, stdio: 'inherit' });
		if (result.status !== 0) {
			console.error(`[bootstrap] FAILED: ${target.name}@${target.version} (exit ${result.status})`);
			failures += 1;
		}
	}
} finally {
	rmSync(staging, { recursive: true, force: true });
}

if (failures > 0) {
	console.error(`[bootstrap] ${failures} package(s) failed`);
	process.exit(1);
}

if (publishForReal) {
	console.log('\n[bootstrap] done. Next:');
	console.log('  1. On npmjs.com, add the trusted publisher (baseballyama/rsvelte, release.yml) to each package above.');
	console.log('  2. Re-run the Release workflow — already-published versions are skipped.');
} else {
	console.log('\n[bootstrap] dry run only — nothing was published. Re-run with --yes to publish.');
}
