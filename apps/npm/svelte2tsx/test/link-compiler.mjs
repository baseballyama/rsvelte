// Dev/CI setup: point `@rsvelte/compiler` at the repo's in-place wasm build
// (`/pkg`, the same directory publishConfig redirects the published package to).
//
// pnpm links the `@rsvelte/compiler` workspace dependency to `apps/npm/compiler`,
// which carries only version/metadata — the wasm glue lives in `/pkg` after
// both wasm builds and `pnpm run finalize-pkg`. A real
// `npm i @rsvelte/svelte2tsx` gets the full
// pkg contents under `node_modules/@rsvelte/compiler`; this reproduces that for
// the source checkout so the sync-API test resolves the same way consumers do.

import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgDir = resolve(here, '../../../../pkg');
const link = resolve(here, '../node_modules/@rsvelte/compiler');

if (!existsSync(resolve(pkgDir, 'playground/rsvelte_lint.js'))) {
	console.error(
		'link-compiler: /pkg is not built. Run `pnpm run build:wasm:core && pnpm run build:wasm:playground && pnpm run finalize-pkg` first.',
	);
	process.exit(1);
}

mkdirSync(dirname(link), { recursive: true });
rmSync(link, { force: true, recursive: true });
symlinkSync(pkgDir, link, 'dir');
console.log('link-compiler: @rsvelte/compiler -> /pkg');
