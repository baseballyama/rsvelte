#!/usr/bin/env node
// Guard `crates/rsvelte_lint_types/Cargo.lock` against drift.
//
// That crate is its own Cargo workspace (it path-depends on
// `submodules/corsa-bind`), so nothing in the root workspace ever re-resolves
// its lock. Every in-repo crate version bump — a Changesets release, a manual
// an in-repo crate bump — silently staleifies it, and the only job that consumes
// it (`type-aware-lint.yml`, `--locked`) is path-filtered to the lint crates.
// The drift therefore detonates on an unrelated later PR instead of the one
// that introduced it. This check runs on every PR so it fails at introduction.
//
// Two layers:
//   1. text audit (no cargo, no submodule): every in-repo crate pinned in the
//      lock must match its `crates/<name>/Cargo.toml` `[package].version`.
//   2. resolution (`cargo metadata --locked`): ground truth, catches dependency
//      graph / requirement / oxc-patch / corsa-bind drift too.
//
// Layer 2 needs `submodules/corsa-bind` checked out. If it's missing this
// script inits it itself (public repo, shallow, ~3s) rather than silently
// falling back to layer 1 alone — a text-pin match is not evidence the lock
// resolves, and reporting it as a pass previously let a 15-entry oxc-rev
// drift through undetected on every machine that hadn't run
// `git submodule update --init submodules/corsa-bind`. If resolution still
// cannot happen (no network, no cargo), that is reported as a distinct,
// non-passing outcome — never printed or exit-coded like a real pass — unless
// the caller opted in with `--allow-unresolved` (used by `version-packages`,
// which must not hard-fail on infra flakiness; see that script for why).

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = 'crates/rsvelte_lint_types/Cargo.toml';
const lockRel = 'crates/rsvelte_lint_types/Cargo.lock';
const lockPath = resolve(repoRoot, lockRel);
const corsaBind = resolve(repoRoot, 'submodules/corsa-bind');

const argv = new Set(process.argv.slice(2));
const fix = argv.has('--fix');
// `--require-resolve` is still accepted (ci.yml passes it) but is now a
// no-op: resolution is attempted by default via the self-init below.
const allowUnresolved = argv.has('--allow-unresolved');

const SUBMODULE_INIT_CMD = 'git submodule update --init submodules/corsa-bind';

const FIX_HINT = [
	'Fix it with:',
	'',
	`    ${SUBMODULE_INIT_CMD}`,
	'    pnpm run fix:lint-types-lock',
	'',
	'then commit the updated crates/rsvelte_lint_types/Cargo.lock.',
].join('\n');

function packageField(contents, field) {
	const match = contents.match(
		new RegExp(`\\[package\\][\\s\\S]*?\\n${field}\\s*=\\s*"([^"]+)"`),
	);
	return match?.[1];
}

// name -> version for every crate under `crates/`.
function inRepoCrateVersions() {
	const versions = new Map();
	const cratesDir = join(repoRoot, 'crates');
	for (const entry of readdirSync(cratesDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const tomlPath = join(cratesDir, entry.name, 'Cargo.toml');
		if (!existsSync(tomlPath)) continue;
		const contents = readFileSync(tomlPath, 'utf8');
		const name = packageField(contents, 'name');
		const version = packageField(contents, 'version');
		if (name && version) versions.set(name, version);
	}
	return versions;
}

function lockEntryRe(name) {
	return new RegExp(`(\\[\\[package\\]\\]\\nname = "${name}"\\nversion = ")([^"]+)(")`);
}

function auditPins(lockText) {
	const drifted = [];
	for (const [name, version] of inRepoCrateVersions()) {
		const match = lockText.match(lockEntryRe(name));
		if (!match) continue; // crate simply isn't in this workspace's graph
		if (match[2] !== version) drifted.push({ name, pinned: match[2], actual: version });
	}
	return drifted;
}

function syncPins(lockText, drifted) {
	let out = lockText;
	for (const { name, actual } of drifted) {
		out = out.replace(lockEntryRe(name), `$1${actual}$3`);
	}
	return out;
}

function runCargoMetadata(locked) {
	const args = ['metadata', '--format-version', '1', '--manifest-path', manifest];
	if (locked) args.push('--locked');
	execFileSync('cargo', args, {
		cwd: repoRoot,
		stdio: ['ignore', 'ignore', 'inherit'],
	});
}

function haveCorsaBind() {
	return existsSync(corsaBind) && readdirSync(corsaBind).length > 0;
}

// Shallow + public: cheap enough (~3s measured) to attempt unconditionally
// instead of asking every caller to remember a manual setup step.
function ensureCorsaBind() {
	if (haveCorsaBind()) return { ok: true };
	try {
		execFileSync('git', ['submodule', 'update', '--init', '--depth', '1', 'submodules/corsa-bind'], {
			cwd: repoRoot,
			stdio: ['ignore', 'ignore', 'pipe'],
		});
		return { ok: true };
	} catch (err) {
		const detail = err.stderr ? err.stderr.toString().trim().split('\n')[0] : err.message;
		return { ok: false, reason: `could not check out submodules/corsa-bind (${detail})` };
	}
}

function cargoAvailable() {
	try {
		execFileSync('cargo', ['--version'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

// The one outcome that must never be mistaken for "the lock is fine": layer 2
// (the only layer that catches dependency-graph / oxc-patch drift) did not
// run at all. `--allow-unresolved` is the only way to make this exit 0.
function reportUnresolved(reason) {
	const detail =
		`${lockRel}: resolution NOT verified — ${reason}.\n` +
		`Only the in-repo version-pin text audit ran; dependency-graph / oxc-patch drift would NOT be caught.\n` +
		`Enable it with: ${SUBMODULE_INIT_CMD}`;
	if (allowUnresolved) {
		console.log(`SKIPPED (not a pass): ${detail}`);
		process.exit(0);
	}
	console.error(detail);
	process.exit(1);
}

let lockText = readFileSync(lockPath, 'utf8');
const drifted = auditPins(lockText);

if (fix) {
	if (drifted.length > 0) {
		lockText = syncPins(lockText, drifted);
		writeFileSync(lockPath, lockText);
		for (const { name, pinned, actual } of drifted) {
			console.log(`  ${name}: ${pinned} -> ${actual}`);
		}
	}
	const corsa = ensureCorsaBind();
	if (corsa.ok) {
		runCargoMetadata(false);
		console.log(`Re-resolved ${lockRel}.`);
	} else {
		console.log(
			`Could not re-resolve ${lockRel} — ${corsa.reason}.\n` +
				`Pins were synced textually only; dependency-graph / oxc-patch drift may remain.\n` +
				`Run \`${SUBMODULE_INIT_CMD}\` and re-run to fully re-resolve.`,
		);
	}
	process.exit(0);
}

if (drifted.length > 0) {
	console.error(`${lockRel} is stale: it pins in-repo crate versions that no longer exist.\n`);
	for (const { name, pinned, actual } of drifted) {
		console.error(`  ${name}: lock pins ${pinned}, crates/ declares ${actual}`);
	}
	console.error(`\n${FIX_HINT}`);
	process.exit(1);
}

const corsa = ensureCorsaBind();
if (!corsa.ok) reportUnresolved(corsa.reason);

if (!cargoAvailable()) reportUnresolved('cargo is not installed / not on PATH');

try {
	runCargoMetadata(true);
} catch {
	console.error(
		`\n${lockRel} is out of date — \`cargo metadata --locked\` above refused to update it.\n` +
			`Something in the root workspace changed the resolution for this out-of-workspace crate.\n\n${FIX_HINT}`,
	);
	process.exit(1);
}

console.log(`${lockRel} is up to date.`);
