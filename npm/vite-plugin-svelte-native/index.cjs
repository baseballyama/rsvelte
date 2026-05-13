// Resolve the rsvelte NAPI binding for the current platform and re-export it.
// Mirrors the loader pattern napi-rs generates: resolve a platform-specific
// dependency that ships a single `rsvelte.node` artifact.

const { platform, arch } = process;

function resolveTriple() {
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
		// Node 18+ exposes the runtime glibc version in the report header. An
		// empty value means we're on musl (Alpine, distroless, etc.).
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
	throw new Error(
		`[@rsvelte/vite-plugin-svelte-native] Unsupported platform: ${platform}-${arch}. ` +
			`Open an issue at https://github.com/baseballyama/rsvelte/issues if you'd like it supported.`,
	);
}

const pkgName = `@rsvelte/vite-plugin-svelte-native-${triple}`;
let binding;
try {
	binding = require(`${pkgName}/rsvelte.node`);
} catch (err) {
	throw new Error(
		`[@rsvelte/vite-plugin-svelte-native] Couldn't load the native binding "${pkgName}".\n` +
			`This usually means npm/pnpm skipped the optional dependency for your platform.\n` +
			`Try reinstalling: npm install --include=optional ${pkgName}\n\n` +
			`Original error: ${err.message}`,
	);
}

module.exports = binding;
