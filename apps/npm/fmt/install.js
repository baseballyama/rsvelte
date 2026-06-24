#!/usr/bin/env node
// postinstall for @rsvelte/fmt — set up the native-direct CLI.
//
// The JS launcher (`bin/rsvelte-fmt`) works everywhere but pays a Node cold
// start (~200ms measured) on every invocation. To make the common case
// instant, this script (run once at install time, where Node resolution is
// available) does the esbuild-style trick:
//
//   1. Copy the platform-native `rsvelte-fmt` binary over `bin/rsvelte-fmt`, so
//      the package-manager's `.bin/rsvelte-fmt` symlink now points straight at
//      the native binary — no Node in the hot path.
//   2. Write a `bin/rsvelte-fmt.runtime.json` sidecar with the consumer's
//      `oxfmt` launcher + this Node interpreter. The launcher used to pass these
//      via `--oxfmt-bin` / `RSVELTE_FMT_NODE`; the native binary now reads them
//      from the sidecar instead (see `load_oxfmt_runtime_sidecar` in main.rs).
//
// This is best-effort: any failure leaves the JS launcher in place, which is
// correct (just slower). Windows is left on the JS launcher — package managers
// generate a Node shim for the `.bin` entry there, so a raw `.exe` swapped in
// at an extensionless path wouldn't be executed directly anyway.

const fs = require('node:fs');
const path = require('node:path');
const { resolvePlatformBinary, resolveOxfmtLauncher } = require('./lib/resolve.cjs');

function main() {
	if (process.platform === 'win32') {
		// Keep the JS launcher: a `.bin` shim runs it through Node, and an
		// extensionless native binary isn't directly executable on Windows.
		return;
	}

	const nativeBin = resolvePlatformBinary();
	if (!nativeBin) {
		// Optional platform dependency missing (or unsupported platform) — the JS
		// launcher will surface a clear error if it's ever run.
		return;
	}

	const binTarget = path.join(__dirname, 'bin', 'rsvelte-fmt');
	const sidecar = path.join(__dirname, 'bin', 'rsvelte-fmt.runtime.json');

	try {
		// Copy (not symlink): the package-manager's `.bin` symlink points here, so
		// this file must BE the native binary. Copying from the platform package
		// (which is never mutated) keeps re-installs idempotent.
		fs.copyFileSync(nativeBin, binTarget);
		fs.chmodSync(binTarget, 0o755);
	} catch (err) {
		// Read-only FS or similar — fall back to the JS launcher. Restore it only
		// if we managed to clobber the file with a partial copy.
		console.warn(`[@rsvelte/fmt] native-direct setup skipped: ${err.message}`);
		return;
	}

	const runtime = {
		node: process.execPath,
		// May be null: oxfmt is an optional peer dep. The binary then resolves
		// `oxfmt` on `$PATH` (or runs `.svelte`/`.ts`/`.js` in-process with no
		// oxfmt at all).
		oxfmtBin: resolveOxfmtLauncher(),
	};
	try {
		fs.writeFileSync(sidecar, JSON.stringify(runtime, null, '\t') + '\n');
	} catch (err) {
		console.warn(`[@rsvelte/fmt] could not write runtime sidecar: ${err.message}`);
	}
}

main();
