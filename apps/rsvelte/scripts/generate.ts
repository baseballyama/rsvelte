// Builds the WebAssembly module of rsvelte/compiler into generated/wasm/ (ignored by Git): the
// browser host without the site's playground. Run from apps/rsvelte:
// `node scripts/generate.ts [--dev]`. `--dev` builds unoptimized, for the tests.

import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { dev: { type: 'boolean', default: false } } });

const out = path.resolve(import.meta.dirname, '../generated/wasm');
rmSync(out, { recursive: true, force: true });

execFileSync(
	'wasm-pack',
	[
		'build',
		'crates/hosts/browser',
		'--out-dir',
		out,
		'--out-name',
		'rsvelte',
		'--target',
		'web',
		'--no-pack',
		values.dev ? '--dev' : '--release',
		'--',
		'--no-default-features',
	],
	{ cwd: path.resolve(import.meta.dirname, '../../..'), stdio: 'inherit' },
);
// wasm-pack writes these for a package of its own; this package lists its files itself.
rmSync(path.join(out, '.gitignore'), { force: true });
