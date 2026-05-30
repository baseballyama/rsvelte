#!/usr/bin/env node
// Stage the per-platform svelte-check binaries produced by the matrix build
// into their corresponding `npm/svelte-check-<triple>/` directories so
// `pnpm publish` picks them up.
//
// Expected layout under the artifact root (default `./artifacts`):
//
//   artifacts/
//     svelte-check-darwin-arm64/svelte-check
//     svelte-check-darwin-x64/svelte-check
//     svelte-check-linux-x64-gnu/svelte-check
//     svelte-check-linux-arm64-gnu/svelte-check
//     svelte-check-win32-x64-msvc/svelte-check.exe
//
// The artifact directory name mirrors the upload-artifact name used in the
// release workflow's `build-svelte-check` job.

import { copyFileSync, chmodSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const artifactRoot = resolve(repoRoot, process.env.SVELTE_CHECK_ARTIFACT_ROOT || 'artifacts');

const targets = [
	{ triple: 'darwin-arm64', binary: 'svelte-check' },
	{ triple: 'darwin-x64', binary: 'svelte-check' },
	{ triple: 'linux-x64-gnu', binary: 'svelte-check' },
	{ triple: 'linux-arm64-gnu', binary: 'svelte-check' },
	{ triple: 'win32-x64-msvc', binary: 'svelte-check.exe' },
];

let missing = 0;
for (const { triple, binary } of targets) {
	const src = resolve(artifactRoot, `svelte-check-${triple}`, binary);
	const dest = resolve(repoRoot, `npm/svelte-check-${triple}`, binary);
	if (!existsSync(src)) {
		console.warn(`[stage] missing artifact: ${src}`);
		missing += 1;
		continue;
	}
	copyFileSync(src, dest);
	// Make sure the binary is executable. The platform packages are
	// published via `scripts/release/publish-platform-binaries.mjs` (`npm publish`),
	// which preserves the file mode in the tarball — without that hop
	// `pnpm publish` would normalise it back to 0644.
	if (!binary.endsWith('.exe')) {
		chmodSync(dest, 0o755);
	}
	const size = statSync(dest).size;
	console.log(`[stage] ${dest} (${size} bytes)`);
}

if (missing > 0) {
	console.error(`[stage] ${missing} artifact(s) missing — refusing to continue`);
	process.exit(1);
}
