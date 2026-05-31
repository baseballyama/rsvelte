#!/usr/bin/env node
// Sync the npm package version from `apps/npm/compiler/package.json`
// (managed by changesets) into `crates/rsvelte_core/Cargo.toml` and the
// repo-root `Cargo.lock`.
//
// `wasm-pack build` derives `pkg/package.json` from the rsvelte_core
// crate's Cargo.toml, so keeping these aligned is what makes "bump the
// workspace package.json via changesets, then publish the freshly built
// pkg/" produce a coherent npm release.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const npmPkgPath = resolve(repoRoot, 'apps/npm/compiler/package.json');
const cargoTomlPath = resolve(repoRoot, 'crates/rsvelte_core/Cargo.toml');
const cargoLockPath = resolve(repoRoot, 'Cargo.lock');

const targetVersion = JSON.parse(readFileSync(npmPkgPath, 'utf8')).version;
if (!targetVersion) {
	console.error(`No "version" field in ${npmPkgPath}`);
	process.exit(1);
}

function patchCargoToml() {
	const original = readFileSync(cargoTomlPath, 'utf8');
	// Replace the version line in the top-level [package] table only.
	// `[package]` is the very first table in Cargo.toml; we match from it up
	// to the next `[` (start of any other table) to scope the replacement.
	const re = /(\[package\][\s\S]*?\nversion\s*=\s*")([^"]+)(")/;
	const match = original.match(re);
	if (!match) {
		throw new Error('Failed to find [package].version in Cargo.toml');
	}
	if (match[2] === targetVersion) return;
	writeFileSync(cargoTomlPath, original.replace(re, `$1${targetVersion}$3`));
}

function patchCargoLock() {
	const original = readFileSync(cargoLockPath, 'utf8');
	// Each package entry in Cargo.lock looks like:
	//   [[package]]
	//   name = "rsvelte_core"
	//   version = "0.1.0"
	// Match exactly the entry whose name is the crate we publish.
	const re =
		/(\[\[package\]\]\nname = "rsvelte_core"\nversion = ")([^"]+)(")/;
	const match = original.match(re);
	if (!match) {
		throw new Error('Failed to find rsvelte_core entry in Cargo.lock');
	}
	if (match[2] === targetVersion) return;
	writeFileSync(cargoLockPath, original.replace(re, `$1${targetVersion}$3`));
}

patchCargoToml();
patchCargoLock();
console.log(`Synced version ${targetVersion} into Cargo.toml and Cargo.lock`);
