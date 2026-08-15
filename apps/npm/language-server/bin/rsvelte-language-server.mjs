#!/usr/bin/env node
// Launcher for `rsvelte-language-server`.
//
// It prefers the native Rust server shipped in the optional
// `@rsvelte/language-server-<triple>` packages and falls back to the bundled
// JS server (`dist/server.mjs`) when no platform package is installed — so an
// unsupported platform, or an install that skipped optional dependencies,
// keeps the capabilities it has today instead of failing outright.
//
// Like the @rsvelte/fmt and @rsvelte/lint launchers, this file is never
// rewritten in place: pnpm bakes a shim interpreter from this file's shebang at
// link time, so swapping it for a native binary post-install would make that
// shim feed Mach-O/ELF bytes to Node.

import { spawnSync } from 'node:child_process';
import { constants as osConstants } from 'node:os';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	ensureExecutable,
	platformPackage,
	resolvePlatformBinary,
} from '../lib/resolve.mjs';

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const argv = process.argv.slice(2);

// Escape hatches for editors and debugging: point at a locally built server, or
// force the JS implementation when the native one misbehaves.
const override = process.env.RSVELTE_LANGUAGE_SERVER_BIN;
const forceJs = process.env.RSVELTE_LANGUAGE_SERVER_JS === '1';

let command;
let args;
if (override) {
	command = override;
	args = argv;
} else {
	const native = forceJs ? null : resolvePlatformBinary();
	if (native) {
		ensureExecutable(native);
		command = native;
		args = argv;
	} else {
		const jsServer = join(pkgRoot, 'dist', 'server.mjs');
		if (!existsSync(jsServer)) {
			const { triple, pkgName } = platformPackage();
			const why = forceJs
				? 'RSVELTE_LANGUAGE_SERVER_JS=1 forced it.'
				: triple
					? `the native package "${pkgName}" isn't installed.\nTry reinstalling: npm install --include=optional ${pkgName}`
					: `platform ${process.platform}-${process.arch} has no prebuilt binary.`;
			console.error(
				`[@rsvelte/language-server] No server to run: the JS fallback (${jsServer}) is missing and ${why}`,
			);
			process.exit(1);
		}
		command = process.execPath;
		args = [jsServer, ...argv];
	}
}

const result = spawnSync(command, args, {
	stdio: 'inherit',
	windowsHide: true,
	env: {
		...process.env,
		RSVELTE_PREPROCESS_NODE: process.env.RSVELTE_PREPROCESS_NODE ?? process.execPath,
	},
});

if (result.error) {
	console.error(
		`[@rsvelte/language-server] Failed to exec ${command}: ${result.error.message}`,
	);
	process.exit(1);
}

// A signal termination leaves `status` null; returning `status ?? 0` would mask
// the crash as a clean exit.
if (result.signal) {
	const signum = osConstants.signals[result.signal];
	console.error(`[@rsvelte/language-server] ${command} was terminated by ${result.signal}.`);
	process.exit(typeof signum === 'number' ? 128 + signum : 1);
}
process.exit(result.status ?? 0);
