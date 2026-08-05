#!/usr/bin/env node
// Stage the per-platform rsvelte-language-server artifacts produced by the
// matrix build into their corresponding `apps/npm/language-server-<triple>/`
// directories so `pnpm publish` picks them up.
//
// Expected layout under the artifact root (default `./artifacts`):
//
//   artifacts/
//     rsvelte-language-server-darwin-arm64/rsvelte-language-server
//     rsvelte-language-server-darwin-x64/rsvelte-language-server
//     rsvelte-language-server-linux-x64-gnu/rsvelte-language-server
//     rsvelte-language-server-linux-arm64-gnu/rsvelte-language-server
//     rsvelte-language-server-win32-x64-msvc/rsvelte-language-server.exe
//
// The artifact directory name mirrors the upload-artifact name used in the
// release workflow's `build-rsvelte-language-server` job.

import { copyFileSync, chmodSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const artifactRoot = resolve(
	repoRoot,
	process.env.LANGUAGE_SERVER_ARTIFACT_ROOT || 'artifacts',
);

const targets = [
	{ triple: 'darwin-arm64', binary: 'rsvelte-language-server' },
	{ triple: 'darwin-x64', binary: 'rsvelte-language-server' },
	{ triple: 'linux-x64-gnu', binary: 'rsvelte-language-server' },
	{ triple: 'linux-arm64-gnu', binary: 'rsvelte-language-server' },
	{ triple: 'win32-x64-msvc', binary: 'rsvelte-language-server.exe' },
];

let missing = 0;
for (const { triple, binary } of targets) {
	const src = resolve(artifactRoot, `rsvelte-language-server-${triple}`, binary);
	const dest = resolve(repoRoot, `apps/npm/language-server-${triple}`, binary);
	if (!existsSync(src)) {
		console.warn(`[stage] missing artifact: ${src}`);
		missing += 1;
		continue;
	}
	copyFileSync(src, dest);
	// The platform packages publish via `npm publish`
	// (`scripts/release/publish-platform-binaries.mjs`), which preserves the
	// file mode — `pnpm publish` would normalise it back to 0644.
	if (!binary.endsWith('.exe')) {
		chmodSync(dest, 0o755);
	}
	console.log(`[stage] ${dest} (${statSync(dest).size} bytes)`);
}

if (missing > 0) {
	console.error(`[stage] ${missing} artifact(s) missing — refusing to continue`);
	process.exit(1);
}
