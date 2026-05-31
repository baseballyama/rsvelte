#!/usr/bin/env node
// `wasm-pack build` writes `pkg/package.json` based on the Cargo crate name
// (`rsvelte_core`). We publish under the scoped npm name
// `@rsvelte/compiler`, so we overlay the npm-side metadata here after the
// wasm build completes and before `pnpm publish` reads it.
//
// The version is intentionally left as wasm-pack produced it: that comes from
// `Cargo.toml`, which `sync-version.mjs` has already aligned with the version
// in `apps/npm/compiler/package.json`. Keeping wasm-pack as the version writer
// avoids a second source of truth.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const pkgJsonPath = resolve(repoRoot, 'pkg/package.json');
const sourceJsonPath = resolve(repoRoot, 'apps/npm/compiler/package.json');

const generated = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
const source = JSON.parse(readFileSync(sourceJsonPath, 'utf8'));

// Override the published identity. We don't carry the `publishConfig.directory`
// redirect into the published package — once pnpm packs from `pkg/`, that
// field would only confuse downstream consumers if it shipped to the registry.
generated.name = source.name;
if (source.repository) generated.repository = source.repository;
if (source.homepage) generated.homepage = source.homepage;
if (source.bugs) generated.bugs = source.bugs;
if (source.keywords) generated.keywords = source.keywords;

writeFileSync(pkgJsonPath, JSON.stringify(generated, null, 2) + '\n');
console.log(`Finalized pkg/package.json as ${generated.name}@${generated.version}`);
