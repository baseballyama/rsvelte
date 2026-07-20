#!/usr/bin/env node
// Stage the per-platform rsvelte-lint artifacts produced by the matrix build
// into their corresponding `apps/npm/lint-<triple>/` directories so
// `pnpm publish` picks them up. Each triple ships TWO files: the `rsvelte-lint`
// CLI binary and the `rsvelte_lint.node` NAPI addon (the engine embedded by
// @rsvelte/oxlint-plugin's native path).
//
// Expected layout under the artifact root (default `./artifacts`):
//
//   artifacts/
//     rsvelte-lint-darwin-arm64/{rsvelte-lint,rsvelte_lint.node}
//     rsvelte-lint-darwin-x64/{rsvelte-lint,rsvelte_lint.node}
//     rsvelte-lint-linux-x64-gnu/{rsvelte-lint,rsvelte_lint.node}
//     rsvelte-lint-linux-arm64-gnu/{rsvelte-lint,rsvelte_lint.node}
//     rsvelte-lint-win32-x64-msvc/{rsvelte-lint.exe,rsvelte_lint.node}
//
// The artifact directory name mirrors the upload-artifact name used in the
// release workflow's `build-rsvelte-lint` job.

import { copyFileSync, chmodSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const artifactRoot = resolve(repoRoot, process.env.LINT_ARTIFACT_ROOT || 'artifacts');

const targets = [
	{ triple: 'darwin-arm64', binary: 'rsvelte-lint' },
	{ triple: 'darwin-x64', binary: 'rsvelte-lint' },
	{ triple: 'linux-x64-gnu', binary: 'rsvelte-lint' },
	{ triple: 'linux-arm64-gnu', binary: 'rsvelte-lint' },
	{ triple: 'win32-x64-msvc', binary: 'rsvelte-lint.exe' },
];

let missing = 0;
for (const { triple, binary } of targets) {
	const artifactDir = resolve(artifactRoot, `rsvelte-lint-${triple}`);
	const destDir = resolve(repoRoot, `apps/npm/lint-${triple}`);

	// The CLI binary (executable).
	const binSrc = resolve(artifactDir, binary);
	const binDest = resolve(destDir, binary);
	if (!existsSync(binSrc)) {
		console.warn(`[stage] missing artifact: ${binSrc}`);
		missing += 1;
	} else {
		copyFileSync(binSrc, binDest);
		// Make sure the binary is executable. The platform packages are
		// published via `scripts/release/publish-platform-binaries.mjs` (`npm publish`),
		// which preserves the file mode in the tarball — without that hop
		// `pnpm publish` would normalise it back to 0644.
		if (!binary.endsWith('.exe')) {
			chmodSync(binDest, 0o755);
		}
		console.log(`[stage] ${binDest} (${statSync(binDest).size} bytes)`);
	}

	// The NAPI addon (dlopen'd, not exec'd — no +x needed).
	const nodeSrc = resolve(artifactDir, 'rsvelte_lint.node');
	const nodeDest = resolve(destDir, 'rsvelte_lint.node');
	if (!existsSync(nodeSrc)) {
		console.warn(`[stage] missing artifact: ${nodeSrc}`);
		missing += 1;
	} else {
		copyFileSync(nodeSrc, nodeDest);
		console.log(`[stage] ${nodeDest} (${statSync(nodeDest).size} bytes)`);
	}
}

if (missing > 0) {
	console.error(`[stage] ${missing} artifact(s) missing — refusing to continue`);
	process.exit(1);
}
