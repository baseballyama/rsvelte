#!/usr/bin/env node
// Guard `crates/rsvelte_lint_types/Cargo.lock` against drift.
//
// That crate is its own Cargo workspace (it path-depends on
// `submodules/corsa-bind`), so nothing in the root workspace ever re-resolves
// its lock. Every in-repo crate version bump — a Changesets release, a manual
// `rsvelte_esrap` bump — silently staleifies it, and the only job that consumes
// it (`type-aware-lint.yml`, `--locked`) is path-filtered to the lint crates.
// The drift therefore detonates on an unrelated later PR instead of the one
// that introduced it. This check runs on every PR so it fails at introduction.
//
// Two layers:
//   1. text audit (no cargo, no submodule): every in-repo crate pinned in the
//      lock must match its `crates/<name>/Cargo.toml` `[package].version`.
//   2. resolution (`cargo metadata --locked`): ground truth, catches dependency
//      graph / requirement / oxc-patch / corsa-bind drift too. Skipped when
//      `submodules/corsa-bind` is absent unless `--require-resolve` is passed.

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
const requireResolve = argv.has('--require-resolve');

const FIX_HINT = [
	'Fix it with:',
	'',
	'    git submodule update --init --depth 1 submodules/corsa-bind',
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
	if (existsSync(corsaBind) && readdirSync(corsaBind).length > 0) {
		runCargoMetadata(false);
		console.log(`Re-resolved ${lockRel}.`);
	} else {
		console.log(
			`submodules/corsa-bind is not checked out — pins synced textually only.\n` +
				`Run \`git submodule update --init --depth 1 submodules/corsa-bind\` and re-run to fully re-resolve.`,
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

const haveCorsaBind = existsSync(corsaBind) && readdirSync(corsaBind).length > 0;
if (!haveCorsaBind) {
	if (requireResolve) {
		console.error(
			'submodules/corsa-bind is not checked out, so the lock cannot be resolved.\n' +
				'Run: git submodule update --init --depth 1 submodules/corsa-bind',
		);
		process.exit(1);
	}
	console.log(`${lockRel} pins match crates/ (resolution check skipped: no corsa-bind).`);
	process.exit(0);
}

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
