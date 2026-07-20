#!/usr/bin/env node
// Sync each npm package version (managed by changesets) into the matching
// Rust crate's `Cargo.toml` `[package].version` and the repo-root `Cargo.lock`.
//
// Why this exists:
// - `@rsvelte/compiler` ← `crates/rsvelte_core` AND `crates/rsvelte_lint`:
//   `@rsvelte/compiler` ships the wasm built from `crates/rsvelte_lint`
//   (`build:wasm:core`), which re-exports the `rsvelte_core` compiler wasm
//   API. Both crates embed their own `env!("CARGO_PKG_VERSION")` into the wasm
//   module: `rsvelte_core` backs the compiler `version()` export and
//   `rsvelte_lint` backs `lint_version()`. Keeping BOTH aligned with the
//   release version keeps those runtime version strings honest. (The published
//   `pkg/package.json` version itself is forced by `finalize-pkg.mjs`, which is
//   what actually guards against a build-crate/version desync — but we still
//   mirror both crates so the in-wasm version exports don't drift.)
//   `crates/rsvelte_lint` was added here after #724 switched `build:wasm:core`
//   from `rsvelte_core` to `rsvelte_lint`; without it `lint_version()` reported
//   a stale `0.1.0`. The native `@rsvelte/lint` CLI (also built from
//   `crates/rsvelte_lint`, reporting `--version` from `CARGO_PKG_VERSION`) needs
//   no separate mapping: it shares a `fixed` changeset group with
//   `@rsvelte/compiler` (see `.changeset/config.json`), so it always bumps to the
//   same version this rule already mirrors into the `rsvelte_lint` crate.
// - `@rsvelte/fmt` ← `crates/rsvelte_fmt`: the `rsvelte-fmt` binary reports its
//   version from `env!("CARGO_PKG_VERSION")` (clap `#[command(version)]`).
//   Without this sync the crate stayed at `0.1.0` no matter how many releases
//   shipped, so `rsvelte-fmt --version` reported a stale version that never
//   matched the published `@rsvelte/fmt` package (issue #745).
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
		cargoToml: 'crates/rsvelte_core/Cargo.toml',
		lockName: 'rsvelte_core',
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
];

const cargoLockPath = resolve(repoRoot, 'Cargo.lock');

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

function patchCargoLock(original, lockName, targetVersion) {
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
		throw new Error(`Failed to find ${lockName} entry in Cargo.lock`);
	}
	if (match[2] === targetVersion) return original;
	return original.replace(re, `$1${targetVersion}$3`);
}

let lock = readFileSync(cargoLockPath, 'utf8');
const synced = [];
for (const { npm, cargoToml, lockName } of MAPPINGS) {
	const targetVersion = readTargetVersion(npm);
	patchCargoToml(cargoToml, targetVersion);
	lock = patchCargoLock(lock, lockName, targetVersion);
	synced.push(`${lockName}@${targetVersion}`);
}
writeFileSync(cargoLockPath, lock);
console.log(
	`Synced versions into Cargo.toml and Cargo.lock: ${synced.join(', ')}`,
);
