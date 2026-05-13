#!/usr/bin/env node
// Loader for the @rsvelte/svelte-check CLI. Resolves the right
// `@rsvelte/svelte-check-<triple>` optional dependency for the current
// platform and execs its binary.

const { spawnSync } = require('node:child_process');
const path = require('node:path');

function resolveTriple() {
	const { platform, arch } = process;
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
		// Detect musl vs glibc. Node 18+ exposes the runtime glibc version in
		// `process.report.getReport().header.glibcVersionRuntime`; if it's empty
		// we're almost certainly on musl.
		let isMusl = false;
		try {
			const header = process.report.getReport().header;
			isMusl = !header.glibcVersionRuntime;
		} catch {
			isMusl = false;
		}
		const libc = isMusl ? 'musl' : 'gnu';
		if (arch === 'x64') return `linux-x64-${libc}`;
		if (arch === 'arm64') return `linux-arm64-${libc}`;
	} else if (platform === 'win32') {
		if (arch === 'x64') return 'win32-x64-msvc';
	}
	return null;
}

const triple = resolveTriple();
if (!triple) {
	console.error(
		`[@rsvelte/svelte-check] Unsupported platform: ${process.platform}-${process.arch}.\n` +
			`Open an issue at https://github.com/baseballyama/rsvelte/issues if you'd like this platform supported.`,
	);
	process.exit(1);
}

const pkgName = `@rsvelte/svelte-check-${triple}`;
const binName = process.platform === 'win32' ? 'svelte-check.exe' : 'svelte-check';

let binPath;
try {
	binPath = require.resolve(`${pkgName}/${binName}`);
} catch (err) {
	console.error(
		`[@rsvelte/svelte-check] Couldn't find the platform binary "${pkgName}".\n` +
			`This usually means npm/pnpm skipped the optional dependency for your platform.\n` +
			`Try reinstalling: npm install --include=optional ${pkgName}\n\n` +
			`Original error: ${err.message}`,
	);
	process.exit(1);
}

const result = spawnSync(binPath, process.argv.slice(2), {
	stdio: 'inherit',
	windowsHide: true,
});

if (result.error) {
	console.error(`[@rsvelte/svelte-check] Failed to exec ${binPath}: ${result.error.message}`);
	process.exit(1);
}
process.exit(result.status ?? 0);
