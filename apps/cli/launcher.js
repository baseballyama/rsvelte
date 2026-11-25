#!/usr/bin/env node
// Starts the rsvelte program that npm installed for this machine, with the same arguments, and
// exits as it does.
import { spawnSync } from 'node:child_process';
import { program } from './program.js';

let path;
try {
	path = program();
} catch (error) {
	console.error(`rsvelte: ${error.message}`);
	process.exit(1);
}
const run = spawnSync(path, process.argv.slice(2), { stdio: 'inherit' });
if (run.error) {
	console.error(`rsvelte: ${path}: ${run.error.message}`);
	process.exit(1);
}
if (run.signal) process.kill(process.pid, run.signal);
process.exit(run.status ?? 1);
