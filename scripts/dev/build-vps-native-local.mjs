#!/usr/bin/env node
// Build the NAPI cdylib for the current platform and stage it as
// `npm/vite-plugin-svelte-native-<triple>/rsvelte.node`. Mirrors what the
// release-time matrix in `.github/workflows/release.yml` does per-triple,
// but only for the host triple — used by `pnpm run test:vps-shim` to
// guarantee the artifact is fresh.

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
	dylib = 'libsvelte_compiler_rust.dylib';
} else if (platform === 'darwin' && arch === 'x64') {
	triple = 'darwin-x64';
	dylib = 'libsvelte_compiler_rust.dylib';
} else if (platform === 'linux' && arch === 'x64') {
	triple = 'linux-x64-gnu';
	dylib = 'libsvelte_compiler_rust.so';
} else if (platform === 'linux' && arch === 'arm64') {
	triple = 'linux-arm64-gnu';
	dylib = 'libsvelte_compiler_rust.so';
} else if (platform === 'win32' && arch === 'x64') {
	triple = 'win32-x64-msvc';
	dylib = 'svelte_compiler_rust.dll';
} else {
	console.error(`[build-vps-native] unsupported platform ${platform}/${arch}`);
	process.exit(2);
}

console.log(`[build-vps-native] building NAPI cdylib for ${triple}…`);
execSync('cargo build --release --features napi --lib', {
	cwd: repoRoot,
	stdio: 'inherit',
});

const src = resolve(repoRoot, 'target/release', dylib);
const destDir = resolve(repoRoot, `npm/vite-plugin-svelte-native-${triple}`);
const dest = resolve(destDir, 'rsvelte.node');
if (!existsSync(src)) {
	console.error(`[build-vps-native] cargo build did not produce ${src}`);
	process.exit(3);
}
if (!existsSync(destDir)) {
	mkdirSync(destDir, { recursive: true });
}
copyFileSync(src, dest);
console.log(`[build-vps-native] staged ${dest}`);
