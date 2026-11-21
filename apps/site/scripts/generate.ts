// Builds the browser host's WebAssembly bindings, which the playground runs, into generated/
// (ignored by Git). Run from apps/site: `node scripts/generate.ts [--no-wasm-opt]`. dev, check and
// build run it first. `--no-wasm-opt` skips wasm-opt, for a build that is not deployed.

import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { 'no-wasm-opt': { type: 'boolean', default: false } } });

const site = path.resolve(import.meta.dirname, '..');
const out = path.join(site, 'generated');
rmSync(out, { recursive: true, force: true });

execFileSync(
	'wasm-pack',
	[
		'build',
		'crates/hosts/browser',
		'--out-dir',
		path.join(out, 'wasm'),
		'--out-name',
		'rsvelte_browser',
		'--target',
		'web',
		'--release',
		...(values['no-wasm-opt'] ? ['--no-opt'] : []),
	],
	{ cwd: path.resolve(site, '../..'), stdio: 'inherit' },
);
