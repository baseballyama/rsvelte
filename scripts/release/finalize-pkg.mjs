#!/usr/bin/env node
// `wasm-pack build` writes `pkg/package.json` based on the Cargo crate it
// builds (currently `rsvelte_lint`, which re-exports the `rsvelte_core`
// compiler wasm exports — see `crates/rsvelte_lint/src/wasm.rs`). We publish
// under the scoped npm name `@rsvelte/compiler`, so we overlay the npm-side
// metadata (and the user-facing README, since wasm-pack copies the linter
// crate's README into `pkg/`) here after the wasm build completes and before
// `pnpm publish` reads it.
//
// We also synthesise an `exports` map so consumers get a *stable* subpath to
// the wasm bytes — `@rsvelte/compiler/wasm` — that does not name the internal
// Cargo crate. wasm-pack names its artifacts after the built crate
// (`rsvelte_lint.js`, `rsvelte_lint_bg.wasm`); tools that read the wasm to drive
// `initSync` (svelte-shaker, this repo's own oxlint-plugin) would otherwise have
// to hard-code that crate name and break every time the wasm build retargets a
// different crate (`rsvelte_core_*` → `rsvelte_lint_*` did exactly this and broke
// deep-import consumers). The `./wasm` alias is the contract; the crate-named
// files stay reachable via a `"./*"` passthrough so existing deep imports keep
// resolving.
//
// The version is the changeset-managed `apps/npm/compiler/package.json`
// version — the single source of truth. We force it here rather than trusting
// whatever wasm-pack derived from the built crate's `Cargo.toml`, because the
// built crate is decoupled from the published package's version: if the wasm
// build ever targets a different crate, wasm-pack stamps `pkg/package.json`
// with that crate's own `Cargo.toml` version instead of the release version,
// which npm rejects as already-published (E403) and crashes the changesets
// publish. Owning the version here keeps the published tarball
// correct no matter which crate the wasm build targets, and is also what
// `workspace:^` consumers (e.g. `@rsvelte/svelte2tsx`) read when pnpm rewrites
// their dependency range at publish time.

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const pkgDir = resolve(repoRoot, 'pkg');
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
// wasm-pack copies the built crate's `Cargo.toml` description into
// `pkg/package.json` — for `rsvelte_lint` that is the *linter* description, which
// mislabels a package literally named `@rsvelte/compiler`. Override it with the
// compiler-facing description from the version anchor.
if (source.description) generated.description = source.description;
if (source.repository) generated.repository = source.repository;
if (source.homepage) generated.homepage = source.homepage;
if (source.bugs) generated.bugs = source.bugs;
if (source.keywords) generated.keywords = source.keywords;

// Synthesise a stable `exports` map. wasm-pack leaves `exports` unset and points
// `main`/`module`/`types` at the crate-named glue (`rsvelte_lint.js`), so the
// only way to reach the wasm today is a deep import that hard-codes the crate
// name. We derive the real filenames from what wasm-pack emitted (so this keeps
// working if the built crate is renamed) and expose:
//   "."             → the JS glue (unchanged default import)
//   "./wasm"        → the wasm bytes, under a name that never mentions the crate
//   "./package.json"→ conventional, some tools require it
//   "./*"           → passthrough so existing crate-named deep imports still work
// The trailing `./*` is what keeps `exports` from *narrowing* resolution: without
// it, adding `exports` would make `@rsvelte/compiler/rsvelte_lint_bg.wasm` (used
// by this repo's oxlint-plugin fallback and by older external consumers) fail.
const withDot = (p) => (p.startsWith('./') ? p : `./${p}`);
const jsEntry = generated.main ?? generated.module;
if (!jsEntry) {
	throw new Error('finalize-pkg: wasm-pack pkg/package.json has neither "main" nor "module"');
}
const wasmFile = (generated.files ?? []).find((f) => f.endsWith('_bg.wasm'));
if (!wasmFile) {
	throw new Error('finalize-pkg: no `*_bg.wasm` entry in pkg/package.json "files"');
}
const dotExport = generated.types
	? { types: withDot(generated.types), default: withDot(jsEntry) }
	: withDot(jsEntry);
generated.exports = {
	'.': dotExport,
	'./wasm': withDot(wasmFile),
	'./package.json': './package.json',
	'./*': './*',
};

// Verify every concrete export target actually shipped in `pkg/`, so a future
// crate rename or wasm-pack layout change fails the release loudly here rather
// than publishing an `exports` map that points at missing files. The `./*`
// passthrough is a wildcard with no single target, so it is not checked.
const exportTargets = new Set([withDot(jsEntry), withDot(wasmFile), './package.json']);
if (generated.types) exportTargets.add(withDot(generated.types));
for (const target of exportTargets) {
	if (!existsSync(resolve(pkgDir, target))) {
		throw new Error(`finalize-pkg: exports target ${target} is missing from pkg/`);
	}
}

writeFileSync(pkgJsonPath, JSON.stringify(generated, null, 2) + '\n');
console.log(`Finalized pkg/package.json as ${generated.name}@${generated.version}`);

// Overlay the user-facing README. `wasm-pack` copies the built crate's README
// (`crates/rsvelte_lint/README.md`, the linter docs) into `pkg/README.md`, which
// would otherwise ship as the `@rsvelte/compiler` README on npm. Replace it with
// the compiler-specific README from the version-anchor directory.
copyFileSync(sourceReadmePath, pkgReadmePath);
console.log(`Copied ${sourceReadmePath} -> pkg/README.md`);
