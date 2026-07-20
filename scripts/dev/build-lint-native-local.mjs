#!/usr/bin/env node
// Build the rsvelte-lint NAPI cdylib for the current platform and stage it as
// `apps/npm/lint-<triple>/rsvelte_lint.node`. Mirrors `build-vps-native-local.mjs`
// (and the release-time matrix in `.github/workflows/release.yml`), but only for
// the host triple — used by `pnpm run test:oxlint-plugin` to guarantee the
// native engine artifact is fresh so the plugin's native path is exercised.
//
// Uses `--profile dist-lint` (not `dist`): panic = "unwind", so napi-rs can
// convert a per-file compiler panic into a JS exception instead of aborting the
// whole oxlint run. `-p rsvelte_lint` keeps `--features napi` scoped to this
// crate (rsvelte_core also defines a `napi` feature).

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

const { platform, arch } = process;
let triple;
let dylib;
if (platform === 'darwin' && arch === 'arm64') {
	triple = 'darwin-arm64';
	dylib = 'librsvelte_lint.dylib';
} else if (platform === 'darwin' && arch === 'x64') {
	triple = 'darwin-x64';
	dylib = 'librsvelte_lint.dylib';
} else if (platform === 'linux' && arch === 'x64') {
	triple = 'linux-x64-gnu';
	dylib = 'librsvelte_lint.so';
} else if (platform === 'linux' && arch === 'arm64') {
	triple = 'linux-arm64-gnu';
	dylib = 'librsvelte_lint.so';
} else if (platform === 'win32' && arch === 'x64') {
	triple = 'win32-x64-msvc';
	dylib = 'rsvelte_lint.dll';
} else {
	console.error(`[build-lint-native] unsupported platform ${platform}/${arch}`);
	process.exit(2);
}

console.log(`[build-lint-native] building NAPI cdylib for ${triple}…`);
execSync('cargo build --profile dist-lint --features napi --lib -p rsvelte_lint', {
	cwd: repoRoot,
	stdio: 'inherit',
});

const src = resolve(repoRoot, 'target/dist-lint', dylib);
const destDir = resolve(repoRoot, `apps/npm/lint-${triple}`);
const dest = resolve(destDir, 'rsvelte_lint.node');
if (!existsSync(src)) {
	console.error(`[build-lint-native] cargo build did not produce ${src}`);
	process.exit(3);
}
if (!existsSync(destDir)) {
	mkdirSync(destDir, { recursive: true });
}
copyFileSync(src, dest);
console.log(`[build-lint-native] staged ${dest}`);
