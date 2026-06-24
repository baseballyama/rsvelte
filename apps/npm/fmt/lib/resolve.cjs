// Shared resolution helpers for the @rsvelte/fmt CLI, used by both the JS
// launcher (`bin/rsvelte-fmt`, the fallback when `postinstall` didn't run) and
// the `postinstall` script (`install.js`, which sets up the native-direct bin).
// CommonJS so it loads from an extensionless launcher with no `"type"` field.

const { statSync, readFileSync, constants } = require('node:fs');
const path = require('node:path');

/// Map the current platform/arch to a `@rsvelte/fmt-<triple>` suffix, or `null`
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
	const pkgName = `@rsvelte/fmt-${triple}`;
	const binName = process.platform === 'win32' ? 'rsvelte-fmt.exe' : 'rsvelte-fmt';
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

/// Resolve the consumer's `oxfmt` Node launcher (`oxfmt/bin/oxfmt`), or `null`
/// when oxfmt isn't installed. Never pins a version: whatever the consumer
/// installed (or has on `$PATH`) wins.
function resolveOxfmtLauncher() {
	// Prefer the direct subpath; fall back to reading the package's `bin`
	// field in case `exports` gates subpath resolution.
	try {
		return require.resolve('oxfmt/bin/oxfmt');
	} catch {
		// fall through
	}
	try {
		const pkgJsonPath = require.resolve('oxfmt/package.json');
		const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
		const binRel =
			typeof pkg.bin === 'string' ? pkg.bin : pkg.bin && pkg.bin.oxfmt;
		if (binRel) {
			return path.join(path.dirname(pkgJsonPath), binRel);
		}
	} catch {
		// oxfmt isn't installed — callers fall back to `oxfmt` on `$PATH`.
	}
	return null;
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
	resolveOxfmtLauncher,
	ensureExecutable,
};
