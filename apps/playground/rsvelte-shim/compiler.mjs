// A drop-in shim for `svelte/compiler` that routes compilation through the
// rsvelte NAPI binding instead of the upstream JS compiler. Plugged into the
// Vite build via a Node ESM resolution hook (see `loader.mjs`).
//
// vite-plugin-svelte only consumes four exports from `svelte/compiler`:
//   - compile        (main compile entry)
//   - compileModule  (for `.svelte.{js,ts}` rune modules)
//   - preprocess     (markup/script/style preprocessor pipeline)
//   - VERSION        (semver string, used to gate async features)
//
// Everything else (types, the AST `walk`, etc.) is type-only or unused by the
// runtime build path, so we don't need to mirror it. Type imports are erased
// before this module is ever loaded.

import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

function resolveTriple() {
	const { platform, arch } = process;
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
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
		`[rsvelte-compiler shim] Unsupported platform: ${process.platform}-${process.arch}`
	);
}

// The repo layout keeps prebuilt `.node` artifacts in
// `<repo>/apps/npm/<pkg>-<triple>/`. `apps/playground/rsvelte-shim/` is
// three levels under the repo root.
const repoRoot = join(here, '..', '..', '..');
const nodePath = join(repoRoot, 'apps', 'npm', `vite-plugin-svelte-native-${triple}`, 'rsvelte.node');
const envelopePath = join(repoRoot, 'apps', 'npm', 'vite-plugin-svelte-native', 'envelope.js');

let binding;
try {
	binding = require(nodePath);
} catch (err) {
	throw new Error(
		`[rsvelte-compiler shim] Failed to load NAPI binding at ${nodePath}.\n` +
			`Make sure the binary is built (cargo build --release --features napi --lib).\n\n` +
			`Original error: ${err.message}`
	);
}

// Decode helper for the raw-transfer envelope (Step 2 of the
// Rust↔JS boundary plan). Imported lazily from the shared decoder so
// we don't duplicate the byte-format constants.
const { decodeEnvelope } = require(envelopePath);

let logged = false;
function logOnce() {
	if (logged) return;
	logged = true;
	process.stderr.write(`[rsvelte] compiling docs via NAPI (${triple})\n`);
}

// The upstream svelte version we mirror. vite-plugin-svelte does
// `gte(VERSION, '5.36.0')` to decide whether async features are available.
// rsvelte targets sveltejs/svelte@5.56.3, so report that.
export const VERSION = '5.56.3';

// The NAPI compile binding deserialises `options` via serde_json, which can't
// represent JS functions. vite-plugin-svelte sets `options.cssHash = () => …`
// per file, so we have to strip function-valued keys before crossing the
// boundary. rsvelte's compiler falls back to its own (deterministic) cssHash
// implementation in that case, which still produces consistent class names
// between the emitted markup and the scoped CSS.
function sanitiseOptions(options) {
	if (!options || typeof options !== 'object') return options;
	const out = {};
	for (const [k, v] of Object.entries(options)) {
		if (typeof v === 'function') continue;
		out[k] = v;
	}
	return out;
}

export function compile(source, options) {
	logOnce();
	// Raw-transfer fast path: NAPI hands us a single Buffer with the
	// whole compile result packed, and `decodeEnvelope` lifts only
	// the fields the caller reads.
	return decodeEnvelope(binding.compileEnvelope(source, sanitiseOptions(options)));
}

export function compileModule(source, options) {
	logOnce();
	return decodeEnvelope(binding.compileModuleEnvelope(source, sanitiseOptions(options)));
}

export function preprocess(source, groups, options) {
	logOnce();
	// The NAPI binding now matches the upstream svelte/compiler contract
	// (PR #133): `preprocess(source, group | group[], { filename? })`. Pass
	// arguments through as-is.
	return binding.preprocess(source, groups, options);
}

// Some consumers do `import * as svelte from 'svelte/compiler'` and access
// these as properties, so include them on the default export too.
export default { VERSION, compile, compileModule, preprocess };
