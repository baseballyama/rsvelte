#!/usr/bin/env node
// Stage the per-platform NAPI `.node` binaries produced by the matrix build
// into their corresponding `apps/npm/vite-plugin-svelte-native-<triple>/` package
// directory so `pnpm publish` picks them up.
//
// Expected layout under the artifact root (default `./artifacts`):
//
//   artifacts/
//     vps-native-darwin-arm64/rsvelte.node
//     vps-native-darwin-x64/rsvelte.node
//     vps-native-linux-x64-gnu/rsvelte.node
//     vps-native-linux-arm64-gnu/rsvelte.node
//     vps-native-win32-x64-msvc/rsvelte.node

import { copyFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const artifactRoot = resolve(repoRoot, process.env.VPS_NATIVE_ARTIFACT_ROOT || 'artifacts');

const triples = [
	'darwin-arm64',
	'darwin-x64',
	'linux-x64-gnu',
	'linux-arm64-gnu',
	'win32-x64-msvc',
];

let missing = 0;
for (const triple of triples) {
	const src = resolve(artifactRoot, `vps-native-${triple}`, 'rsvelte.node');
	const dest = resolve(repoRoot, `apps/npm/vite-plugin-svelte-native-${triple}`, 'rsvelte.node');
	if (!existsSync(src)) {
		console.warn(`[stage] missing artifact: ${src}`);
		missing += 1;
		continue;
	}
	copyFileSync(src, dest);
	const size = statSync(dest).size;
	console.log(`[stage] ${dest} (${size} bytes)`);
}

if (missing > 0) {
	console.error(`[stage] ${missing} artifact(s) missing — refusing to continue`);
	process.exit(1);
}
