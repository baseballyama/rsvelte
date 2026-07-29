#!/usr/bin/env node
// Sync each npm package version (managed by changesets) into the matching
// Rust crate's `Cargo.toml` `[package].version` and the repo-root `Cargo.lock`.
//
// Why this exists:
// - `@rsvelte/compiler` ← `crates/rsvelte_core` AND `crates/rsvelte_lint`:
//   `@rsvelte/compiler` ships the wasm built from `crates/rsvelte_lint_bindings`
//   (`build:wasm:core`), which re-exports the `rsvelte_core` compiler wasm API
//   and the linter engine. The two runtime version strings baked into that wasm
//   module resolve to CRATE versions: `rsvelte_core` backs the compiler
//   `version()` export via its own `env!("CARGO_PKG_VERSION")`, and the
//   bindings' `lint_version()` reads `rsvelte_lint::CRATE_VERSION` (this crate's
//   version, not the bindings crate's). Keeping BOTH aligned with the release
//   version keeps those strings honest. (The published `pkg/package.json`
//   version itself is forced by `finalize-pkg.mjs`, which is what actually
//   guards against a build-crate/version desync — but we still mirror both
//   crates so the in-wasm version exports don't drift.)
//   `crates/rsvelte_lint` must be mapped here too since `lint_version()` reports
//   its version; without it `lint_version()` would report a stale `0.1.0`. The
//   native `@rsvelte/lint` CLI (built from `crates/rsvelte_lint`, reporting
//   `--version` from `CARGO_PKG_VERSION`) needs no separate mapping: it shares a
//   `fixed` changeset group with `@rsvelte/compiler` (see
//   `.changeset/config.json`), so it always bumps to the same version this rule
//   already mirrors into the `rsvelte_lint` crate.
// - `@rsvelte/fmt` ← `crates/rsvelte_fmt`: the `rsvelte-fmt` binary reports its
//   version from `env!("CARGO_PKG_VERSION")` (clap `#[command(version)]`).
//   Without this sync the crate stays at `0.1.0` no matter how many releases
//   ship, so `rsvelte-fmt --version` would report a stale version that never
//   matches the published `@rsvelte/fmt` package.
//
// Each binary's `--version` must match the npm package it ships in.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

// npm package.json (changeset-managed) → Rust crate to mirror into.
// `lockName` is the crate's `name` in Cargo.lock.
const MAPPINGS = [
	{
		npm: 'apps/npm/compiler/package.json',
		cargoToml: 'crates/rsvelte/Cargo.toml',
		lockName: 'rsvelte',
	},
	{
		npm: 'apps/npm/compiler/package.json',
		cargoToml: 'crates/rsvelte_core/Cargo.toml',
		lockName: 'rsvelte_core',
	},
	{
		npm: 'apps/npm/compiler/package.json',
		cargoToml: 'crates/rsvelte_projection/Cargo.toml',
		lockName: 'rsvelte_projection',
	},
	{
		// The crate `build:wasm:core` actually builds into `pkg/` → `@rsvelte/compiler`.
		npm: 'apps/npm/compiler/package.json',
		cargoToml: 'crates/rsvelte_lint/Cargo.toml',
		lockName: 'rsvelte_lint',
	},
	{
		npm: 'apps/npm/fmt/package.json',
		cargoToml: 'crates/rsvelte_fmt/Cargo.toml',
		lockName: 'rsvelte_fmt',
	},
	{
		npm: 'apps/npm/svelte-check/package.json',
		cargoToml: 'crates/rsvelte_check/Cargo.toml',
		lockName: 'rsvelte_check',
	},
];

// Exact crates.io edges whose requirement must move with the mapped compiler
// crate versions. `rsvelte_core -> rsvelte_esrap` is intentionally absent:
// esrap is versioned independently and that edge is updated when esrap itself
// is released.
const EXACT_INTERNAL_EDGES = [
	{
		cargoToml: 'crates/rsvelte_projection/Cargo.toml',
		dependency: 'rsvelte_core',
		versionFrom: 'crates/rsvelte_core/Cargo.toml',
	},
	{
		cargoToml: 'crates/rsvelte/Cargo.toml',
		dependency: 'rsvelte_core',
		versionFrom: 'crates/rsvelte_core/Cargo.toml',
	},
	{
		cargoToml: 'crates/rsvelte/Cargo.toml',
		dependency: 'rsvelte_projection',
		versionFrom: 'crates/rsvelte_projection/Cargo.toml',
	},
];

// Every Cargo.lock that pins these crates. `crates/rsvelte_lint_types` is its
// own out-of-workspace workspace (it path-depends on `submodules/corsa-bind`),
// so the root lock does not cover it and its `--locked` CI job breaks on the
// next release unless the bump is mirrored here too.
const CARGO_LOCKS = ['Cargo.lock', 'crates/rsvelte_lint_types/Cargo.lock'];

function readTargetVersion(npmRelPath) {
	const npmPkgPath = resolve(repoRoot, npmRelPath);
	const version = JSON.parse(readFileSync(npmPkgPath, 'utf8')).version;
	if (!version) {
		console.error(`No "version" field in ${npmPkgPath}`);
		process.exit(1);
	}
	return version;
}

function patchCargoToml(cargoRelPath, targetVersion) {
	const cargoTomlPath = resolve(repoRoot, cargoRelPath);
	const original = readFileSync(cargoTomlPath, 'utf8');
	// Replace the version line in the top-level [package] table only.
	// `[package]` is the very first table in Cargo.toml; we match from it up
	// to its `version = "..."` line to scope the replacement.
	const re = /(\[package\][\s\S]*?\nversion\s*=\s*")([^"]+)(")/;
	const match = original.match(re);
	if (!match) {
		throw new Error(`Failed to find [package].version in ${cargoRelPath}`);
	}
	if (match[2] === targetVersion) return;
	writeFileSync(cargoTomlPath, original.replace(re, `$1${targetVersion}$3`));
}

function readCargoVersion(cargoRelPath) {
	const cargoTomlPath = resolve(repoRoot, cargoRelPath);
	const contents = readFileSync(cargoTomlPath, 'utf8');
	const match = contents.match(/\[package\][\s\S]*?\nversion\s*=\s*"([^"]+)"/);
	if (!match) {
		throw new Error(`Failed to find [package].version in ${cargoRelPath}`);
	}
	return match[1];
}

function patchExactDependency(cargoRelPath, dependency, targetVersion) {
	const cargoTomlPath = resolve(repoRoot, cargoRelPath);
	const original = readFileSync(cargoTomlPath, 'utf8');
	const escapedDependency = dependency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const re = new RegExp(
		`(^${escapedDependency}\\s*=\\s*\\{[^\\n]*\\bversion\\s*=\\s*")=[^"]+(")`,
		'm',
	);
	if (!re.test(original)) {
		throw new Error(
			`Failed to find exact ${dependency} dependency requirement in ${cargoRelPath}`,
		);
	}
	writeFileSync(cargoTomlPath, original.replace(re, `$1=${targetVersion}$2`));
}

function patchCargoLock(original, lockName, targetVersion, { required }) {
	// Each package entry in Cargo.lock looks like:
	//   [[package]]
	//   name = "rsvelte_fmt"
	//   version = "0.1.0"
	// Match exactly the entry whose name is the crate we publish.
	const re = new RegExp(
		`(\\[\\[package\\]\\]\\nname = "${lockName}"\\nversion = ")([^"]+)(")`,
	);
	const match = original.match(re);
	if (!match) {
		// A secondary lock only pins the crates that workspace depends on
		// (rsvelte_lint_types has no rsvelte_fmt edge), so a miss there is fine.
		if (!required) return original;
		throw new Error(`Failed to find ${lockName} entry in Cargo.lock`);
	}
	if (match[2] === targetVersion) return original;
	return original.replace(re, `$1${targetVersion}$3`);
}

const synced = [];
const locks = CARGO_LOCKS.map((rel) => ({
	rel,
	path: resolve(repoRoot, rel),
	text: readFileSync(resolve(repoRoot, rel), 'utf8'),
	// The root lock must pin every crate we publish; a miss there is a real bug.
	required: rel === 'Cargo.lock',
}));

for (const { npm, cargoToml, lockName } of MAPPINGS) {
	const targetVersion = readTargetVersion(npm);
	patchCargoToml(cargoToml, targetVersion);
	for (const lock of locks) {
		lock.text = patchCargoLock(lock.text, lockName, targetVersion, {
			required: lock.required,
		});
	}
	synced.push(`${lockName}@${targetVersion}`);
}

for (const { cargoToml, dependency, versionFrom } of EXACT_INTERNAL_EDGES) {
	patchExactDependency(cargoToml, dependency, readCargoVersion(versionFrom));
}

for (const lock of locks) writeFileSync(lock.path, lock.text);
console.log(
	`Synced versions into Cargo.toml and ${CARGO_LOCKS.join(' + ')}: ${synced.join(', ')}`,
);
