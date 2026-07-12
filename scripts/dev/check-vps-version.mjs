#!/usr/bin/env node
// Guard against `apps/npm/vite-plugin-svelte-native/index.cjs`'s hardcoded
// `VERSION` export drifting from the upstream Svelte version actually pinned
// in `submodules/svelte`. `VERSION` is a plain string literal (no build step
// regenerates it), so nothing else catches it silently going stale —
// exactly what happened before this check existed (index.cjs said `5.51.3`
// while the submodule had moved on to `5.56.3`).
//
// No-ops (exit 0) when the submodule isn't checked out, since not every
// contributor/CI job initializes it.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

const submodulePkgPath = resolve(repoRoot, 'submodules/svelte/packages/svelte/package.json');
if (!existsSync(submodulePkgPath)) {
	console.log('[check-vps-version] submodules/svelte not initialized — skipping.');
	process.exit(0);
}

const upstreamVersion = JSON.parse(readFileSync(submodulePkgPath, 'utf8')).version;
if (!upstreamVersion) {
	console.error(`[check-vps-version] ${submodulePkgPath} has no "version" field`);
	process.exit(1);
}

const indexCjsPath = resolve(repoRoot, 'apps/npm/vite-plugin-svelte-native/index.cjs');
const indexCjsSrc = readFileSync(indexCjsPath, 'utf8');
const match = indexCjsSrc.match(/module\.exports\.VERSION\s*=\s*['"]([^'"]+)['"]/);
if (!match) {
	console.error(`[check-vps-version] could not find "module.exports.VERSION = …" in ${indexCjsPath}`);
	process.exit(1);
}
const boundVersion = match[1];

if (boundVersion !== upstreamVersion) {
	console.error(
		`[check-vps-version] apps/npm/vite-plugin-svelte-native/index.cjs VERSION ` +
			`('${boundVersion}') does not match submodules/svelte/packages/svelte/package.json ` +
			`('${upstreamVersion}'). Update the VERSION export to match.`,
	);
	process.exit(1);
}

console.log(`[check-vps-version] VERSION '${boundVersion}' matches submodules/svelte.`);
