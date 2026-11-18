#!/usr/bin/env node
// Starts the rsvelte program that npm installed for this machine, with the same arguments, and
// exits as it does. The package of each platform is in platforms.json beside this directory.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const platforms = JSON.parse(readFileSync(new URL('../platforms.json', import.meta.url), 'utf8'));
const platform = `${process.platform}-${process.arch}`;
const name = platforms[platform];
if (!name) {
	console.error(`rsvelte: there is no build for ${platform}`);
	process.exit(1);
}
let program;
try {
	program = require.resolve(`${name}/rsvelte${process.platform === 'win32' ? '.exe' : ''}`);
} catch {
	console.error(
		`rsvelte: ${name} is not installed; install rsvelte again, with optional dependencies`,
	);
	process.exit(1);
}
const run = spawnSync(program, process.argv.slice(2), { stdio: 'inherit' });
if (run.error) {
	console.error(`rsvelte: ${program}: ${run.error.message}`);
	process.exit(1);
}
if (run.signal) process.kill(process.pid, run.signal);
process.exit(run.status ?? 1);
