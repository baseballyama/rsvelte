// Shared resolution helpers for the @rsvelte/lint CLI, used by both the JS
// launcher (`bin/rsvelte-lint`, the fallback when `postinstall` didn't run) and
// the `postinstall` script (`install.js`, which sets up the native-direct bin).
// CommonJS so it loads from an extensionless launcher with no `"type"` field.
//
// Unlike the sibling @rsvelte/fmt helper, rsvelte-lint has no external tool
// dependency (fmt delegates non-`.svelte` files + `<style>` bodies to oxfmt);
// the linter is fully self-contained, so there is no oxfmt/sidecar resolution.

const { statSync, constants } = require('node:fs');

/// Map the current platform/arch to a `@rsvelte/lint-<triple>` suffix, or `null`
/// when unsupported. Mirrors the platform list in the release build matrix.
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

/// The platform package name + binary basename for the current platform.
/// `triple` is `null` when the platform is unsupported.
function platformPackage() {
	const triple = resolveTriple();
	if (!triple) return { triple: null, pkgName: null, binName: null };
	const pkgName = `@rsvelte/lint-${triple}`;
	const binName = process.platform === 'win32' ? 'rsvelte-lint.exe' : 'rsvelte-lint';
	return { triple, pkgName, binName };
}

/// Resolve the absolute path to the prebuilt native binary for this platform,
/// or `null` when the optional platform package isn't installed.
function resolvePlatformBinary() {
	const { pkgName, binName } = platformPackage();
	if (!pkgName) return null;
	try {
		return require.resolve(`${pkgName}/${binName}`);
	} catch {
		return null;
	}
}

/// Best-effort `chmod +x` on a POSIX file. No-op on Windows / read-only FS.
function ensureExecutable(binPath) {
	if (process.platform === 'win32') return;
	try {
		const mode = statSync(binPath).mode;
		if (!(mode & constants.S_IXUSR)) {
			require('node:fs').chmodSync(binPath, (mode & 0o777) | 0o111);
		}
	} catch {
		// Not fatal — a later spawn surfaces a clear error if it really can't run.
	}
}

module.exports = {
	resolveTriple,
	platformPackage,
	resolvePlatformBinary,
	ensureExecutable,
};
