#!/usr/bin/env node
// Sync each npm package version (managed by changesets) into the matching
// Rust crate's `Cargo.toml` `[package].version` and the repo-root `Cargo.lock`.
//
// Why this exists:
// - `@rsvelte/compiler` ← `crates/rsvelte_core`: `wasm-pack build` derives
//   `pkg/package.json` from the crate's Cargo.toml, so keeping them aligned is
//   what makes "bump the workspace package.json via changesets, then publish
//   the freshly built pkg/" produce a coherent npm release.
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
