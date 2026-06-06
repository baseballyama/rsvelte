#!/usr/bin/env node
// Stage the per-platform rsvelte-fmt binaries produced by the matrix build
// into their corresponding `apps/npm/fmt-<triple>/` directories so
// `pnpm publish` picks them up.
//
// Expected layout under the artifact root (default `./artifacts`):
//
//   artifacts/
//     rsvelte-fmt-darwin-arm64/rsvelte-fmt
//     rsvelte-fmt-darwin-x64/rsvelte-fmt
//     rsvelte-fmt-linux-x64-gnu/rsvelte-fmt
//     rsvelte-fmt-linux-arm64-gnu/rsvelte-fmt
//     rsvelte-fmt-win32-x64-msvc/rsvelte-fmt.exe
//
// The artifact directory name mirrors the upload-artifact name used in the
// release workflow's `build-rsvelte-fmt` job.

import { copyFileSync, chmodSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const artifactRoot = resolve(repoRoot, process.env.FMT_ARTIFACT_ROOT || 'artifacts');

const targets = [
	{ triple: 'darwin-arm64', binary: 'rsvelte-fmt' },
	{ triple: 'darwin-x64', binary: 'rsvelte-fmt' },
	{ triple: 'linux-x64-gnu', binary: 'rsvelte-fmt' },
	{ triple: 'linux-arm64-gnu', binary: 'rsvelte-fmt' },
	{ triple: 'win32-x64-msvc', binary: 'rsvelte-fmt.exe' },
];

let missing = 0;
for (const { triple, binary } of targets) {
	const src = resolve(artifactRoot, `rsvelte-fmt-${triple}`, binary);
	const dest = resolve(repoRoot, `apps/npm/fmt-${triple}`, binary);
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
