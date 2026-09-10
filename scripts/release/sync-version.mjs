#!/usr/bin/env node
// Sync each npm package version (managed by changesets) into the matching
// Rust crate's `Cargo.toml` `[package].version` and the repo-root `Cargo.lock`.
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
		cargoToml: 'crates/rsvelte_compiler_wasm_bindings/Cargo.toml',
		lockName: 'rsvelte_compiler_wasm_bindings',
	},
	{
		npm: 'apps/npm/compiler/package.json',
		cargoToml: 'crates/rsvelte_compiler_wasm/Cargo.toml',
		lockName: 'rsvelte_compiler_wasm',
	},
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
		// The playground export also contains the lint engine.
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
	{
		npm: 'apps/npm/language-server/package.json',
		cargoToml: 'crates/rsvelte_language_server/Cargo.toml',
		lockName: 'rsvelte_language_server',
	},
	{
		// `@rsvelte/capi` publishes nothing; it exists so a changeset can decide
		// the C ABI's version. `rsvelte_version()` returns this crate's
		// `CARGO_PKG_VERSION`, and `capi-autotag.yml` cuts `capi-v<version>` from
		// the same string, so the carrier is what a consumer ends up reading.
		npm: 'apps/npm/capi/package.json',
		cargoToml: 'crates/rsvelte_capi/Cargo.toml',
		lockName: 'rsvelte_capi',
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

function compareVersions(a, b) {
	const pa = a.split('.').map(Number);
	const pb = b.split('.').map(Number);
	for (let i = 0; i < 3; i += 1) {
		if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
	}
	return 0;
}

// A crate version can be hand-edited ahead of its carrier (the C ABI was, before
// `@rsvelte/capi` existed), and the sync would then silently walk it back.
function assertNotBackwards({ npm, cargoToml, targetVersion }) {
	const current = readCargoVersion(cargoToml);
	if (compareVersions(current, targetVersion) <= 0) return;
	console.error(
		`${cargoToml} is at ${current} but ${npm} says ${targetVersion}: syncing would ` +
			`move the crate backwards. Bump ${npm} (write a changeset) rather than editing ` +
			'the crate version by hand.',
	);
	process.exit(1);
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
	assertNotBackwards({ npm, cargoToml, targetVersion });
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
