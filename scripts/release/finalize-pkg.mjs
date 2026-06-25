#!/usr/bin/env node
// `wasm-pack build` writes `pkg/package.json` based on the Cargo crate it
// builds (currently `rsvelte_lint`, which re-exports the `rsvelte_core`
// compiler wasm exports — see `crates/rsvelte_lint/src/wasm.rs`). We publish
// under the scoped npm name `@rsvelte/compiler`, so we overlay the npm-side
// metadata (and the user-facing README, since wasm-pack copies the linter
// crate's README into `pkg/`) here after the wasm build completes and before
// `pnpm publish` reads it.
//
// The version is the changeset-managed `apps/npm/compiler/package.json`
// version — the single source of truth. We force it here rather than trusting
// whatever wasm-pack derived from the built crate's `Cargo.toml`, because the
// built crate is decoupled from the published package's version: when the
// build switched from `rsvelte_core` to `rsvelte_lint` (#724), wasm-pack
// started stamping `pkg/package.json` with `rsvelte_lint`'s crate version
// (`0.1.0`) instead of the release version. That shipped `@rsvelte/compiler`
// as `0.1.0`, which npm rejected as already-published (E403) and crashed the
// changesets publish. Owning the version here keeps the published tarball
// correct no matter which crate the wasm build targets, and is also what
// `workspace:^` consumers (e.g. `@rsvelte/svelte2tsx`) read when pnpm rewrites
// their dependency range at publish time.

import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const pkgJsonPath = resolve(repoRoot, 'pkg/package.json');
const sourceJsonPath = resolve(repoRoot, 'apps/npm/compiler/package.json');
const sourceReadmePath = resolve(repoRoot, 'apps/npm/compiler/README.md');
const pkgReadmePath = resolve(repoRoot, 'pkg/README.md');

const generated = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
const source = JSON.parse(readFileSync(sourceJsonPath, 'utf8'));

// Override the published identity. We don't carry the `publishConfig.directory`
// redirect into the published package — once pnpm packs from `pkg/`, that
// field would only confuse downstream consumers if it shipped to the registry.
generated.name = source.name;
// Surface any drift between the built crate's version and the release version
// so a future build-crate swap that desyncs `sync-version.mjs` is debuggable.
if (generated.version !== source.version) {
	console.warn(
		`finalize-pkg: overriding wasm-pack version ${generated.version} -> ${source.version} ` +
			`(from apps/npm/compiler/package.json). If unexpected, check sync-version.mjs covers the built crate.`,
	);
}
generated.version = source.version;
if (source.repository) generated.repository = source.repository;
if (source.homepage) generated.homepage = source.homepage;
if (source.bugs) generated.bugs = source.bugs;
if (source.keywords) generated.keywords = source.keywords;

writeFileSync(pkgJsonPath, JSON.stringify(generated, null, 2) + '\n');
console.log(`Finalized pkg/package.json as ${generated.name}@${generated.version}`);

// Overlay the user-facing README. `wasm-pack` copies the built crate's README
// (`crates/rsvelte_lint/README.md`, the linter docs) into `pkg/README.md`, which
// would otherwise ship as the `@rsvelte/compiler` README on npm. Replace it with
// the compiler-specific README from the version-anchor directory.
copyFileSync(sourceReadmePath, pkgReadmePath);
console.log(`Copied ${sourceReadmePath} -> pkg/README.md`);
