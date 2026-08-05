// Resolution helpers for the @rsvelte/language-server launcher: they find the
// platform-native `rsvelte-language-server` binary shipped in the optional
// `@rsvelte/language-server-<triple>` packages.
//
// ESM (not `.cjs` like the @rsvelte/fmt / @rsvelte/lint siblings) because this
// package is `"type": "module"`; the resolution logic itself is identical.

import { chmodSync, constants, statSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/// Map the current platform/arch to a `@rsvelte/language-server-<triple>`
/// suffix, or `null` when unsupported. Mirrors the release build matrix.
export function resolveTriple() {
	const { platform, arch } = process;
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
		// Node 18+ exposes the runtime glibc version; an empty value means musl.
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

/// The platform package name + binary basename for the current platform.
/// `triple` is `null` when the platform is unsupported.
export function platformPackage() {
	const triple = resolveTriple();
	if (!triple) return { triple: null, pkgName: null, binName: null };
	const pkgName = `@rsvelte/language-server-${triple}`;
	const binName =
		process.platform === 'win32'
			? 'rsvelte-language-server.exe'
			: 'rsvelte-language-server';
	return { triple, pkgName, binName };
}

/// Resolve the absolute path to the prebuilt native server for this platform,
/// or `null` when the optional platform package isn't installed.
export function resolvePlatformBinary() {
	const { pkgName, binName } = platformPackage();
	if (!pkgName) return null;
	try {
		return require.resolve(`${pkgName}/${binName}`);
	} catch {
		return null;
	}
}

/// Best-effort `chmod +x` on a POSIX file. No-op on Windows / read-only FS.
export function ensureExecutable(binPath) {
	if (process.platform === 'win32') return;
	try {
		const mode = statSync(binPath).mode;
		if (!(mode & constants.S_IXUSR)) {
			chmodSync(binPath, (mode & 0o777) | 0o111);
		}
	} catch {
		// Not fatal — a later spawn surfaces a clear error if it really can't run.
	}
}
