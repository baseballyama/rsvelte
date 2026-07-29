// Dev/CI setup: installs the isolated `tsc` that test/bin.test.mjs's
// intentional-type-error case injects via TSGO_BIN. Idempotent — skips the
// install when a previous run (or a CI cache) already populated it. See
// test/ts-toolchain/package.json for why this lives outside the pnpm
// workspace.

import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, 'ts-toolchain');
const tsc = path.join(dir, 'node_modules', '.bin', 'tsc');

if (!existsSync(tsc)) {
	console.log('setup-ts-toolchain: installing isolated tsc...');
	execFileSync('npm', ['install', '--no-package-lock'], { cwd: dir, stdio: 'inherit' });
}
