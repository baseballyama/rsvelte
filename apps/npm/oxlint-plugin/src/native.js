// Native (NAPI) engine loader.
//
// The rsvelte rule engine ships as a prebuilt `rsvelte_lint.node` inside the
// per-platform `@rsvelte/lint-<triple>` packages (the same packages that back
// the `rsvelte-lint` CLI). This resolves the one for the current platform and
// returns its binding — a synchronous object exposing `lint(source, filename)`
// and `lint_rules()`, byte-identical to the wasm engine. Returns `null` when the
// platform is unsupported or its optional package isn't installed, so the caller
// can fall back to wasm.

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/// Map the current platform/arch to a `@rsvelte/lint-<triple>` suffix, or `null`
/// when unsupported. Mirrors `apps/npm/lint/lib/resolve.cjs`.
export function resolveTriple() {
	const { platform, arch } = process;
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
		// Node 18+ exposes the runtime glibc version in the report header; an
		// empty value means musl (Alpine, distroless, …).
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

/**
 * Load the native binding for this platform, or `null` if unavailable.
 *
 * @returns {{ pkg: string, binding: { lint(s: string, f: string): string, lint_rules(): string } } | null}
 */
export function loadNativeEngine() {
	const triple = resolveTriple();
	if (!triple) return null;
	const pkg = `@rsvelte/lint-${triple}`;
	try {
		const binding = require(`${pkg}/rsvelte_lint.node`);
		if (typeof binding.lint === 'function' && typeof binding.lint_rules === 'function') {
			return { pkg, binding };
		}
	} catch {
		// Optional platform package not installed (or no .node for this triple) —
		// fall back to wasm.
	}
	return null;
}
