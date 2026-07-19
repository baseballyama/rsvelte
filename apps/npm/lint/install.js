#!/usr/bin/env node
// postinstall for @rsvelte/lint — set up the native-direct CLI.
//
// The JS launcher (`bin/rsvelte-lint`) works everywhere but pays a Node cold
// start (~200ms) on every invocation. To make the common case instant, this
// script (run once at install time, where Node resolution is available) does
// the esbuild-style trick: copy the platform-native `rsvelte-lint` binary over
// `bin/rsvelte-lint`, so the package-manager's `.bin/rsvelte-lint` symlink now
// points straight at the native binary — no Node in the hot path.
//
// Unlike @rsvelte/fmt there is no runtime sidecar to write: the linter has no
// external tool (oxfmt) to locate, so a plain binary swap is all that's needed.
//
// This is best-effort: any failure leaves the JS launcher in place, which is
// correct (just slower). Windows is left on the JS launcher — package managers
// generate a Node shim for the `.bin` entry there, so a raw `.exe` swapped in
// at an extensionless path wouldn't be executed directly anyway.

const fs = require('node:fs');
const path = require('node:path');
const { resolvePlatformBinary } = require('./lib/resolve.cjs');

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

	const binTarget = path.join(__dirname, 'bin', 'rsvelte-lint');

	try {
		// Copy (not symlink): the package-manager's `.bin` symlink points here, so
		// this file must BE the native binary. Copying from the platform package
		// (which is never mutated) keeps re-installs idempotent.
		fs.copyFileSync(nativeBin, binTarget);
		fs.chmodSync(binTarget, 0o755);
	} catch (err) {
		// Read-only FS or similar — fall back to the JS launcher.
		console.warn(`[@rsvelte/lint] native-direct setup skipped: ${err.message}`);
	}
}

main();
