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

// The repo layout keeps prebuilt `.node` artifacts in `<repo>/npm/<pkg>-<triple>/`.
// `docs/rsvelte-shim/` is two levels under the repo root.
const repoRoot = join(here, '..', '..');
const nodePath = join(repoRoot, 'npm', `vite-plugin-svelte-native-${triple}`, 'rsvelte.node');

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

let logged = false;
function logOnce() {
	if (logged) return;
	logged = true;
	process.stderr.write(`[rsvelte] compiling docs via NAPI (${triple})\n`);
}

// The upstream svelte version we mirror. vite-plugin-svelte does
// `gte(VERSION, '5.36.0')` to decide whether async features are available.
// rsvelte targets sveltejs/svelte@5.51.3, so report that.
export const VERSION = '5.51.3';

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
	return binding.compile(source, sanitiseOptions(options));
}

export function compileModule(source, options) {
	logOnce();
	return binding.compileModule(source, sanitiseOptions(options));
}

// preprocess: run the chain in plain JS instead of crossing the NAPI bridge.
//
// The Rust-side `napi_preprocess` is a v0.3 Wave-3 component with several
// brittle edges around JS callback marshalling (CalleeHandled signature,
// `undefined` not being a valid `serde_json::Value`, callback return values
// containing function references that fail serde conversion). For a static
// docs site whose only preprocessor is SvelteKit's dev-only warning logger,
// running the pipeline directly in JS is both simpler and avoids those bugs.
//
// This implementation mirrors svelte/preprocess for the markup / script /
// style fields: feed each block through every group in order. Source maps and
// dependency tracking are dropped — this site has no preprocessors that emit
// either.
const SCRIPT_RE = /<script(?<attrs>\s+[^>]*?)?>(?<content>[\s\S]*?)<\/script>/g;
const STYLE_RE = /<style(?<attrs>\s+[^>]*?)?>(?<content>[\s\S]*?)<\/style>/g;

function parseAttrs(raw) {
	const out = {};
	if (!raw) return out;
	const re = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
	let m;
	while ((m = re.exec(raw))) {
		out[m[1]] = m[2] ?? m[3] ?? m[4] ?? true;
	}
	return out;
}

async function runTag(source, re, fn, filename) {
	let out = '';
	let lastIndex = 0;
	let m;
	while ((m = re.exec(source))) {
		const attrs = parseAttrs(m.groups?.attrs ?? '');
		const content = m.groups?.content ?? '';
		out += source.slice(lastIndex, m.index);
		const tagStart = m[0].indexOf(content);
		const open = source.slice(m.index, m.index + tagStart);
		const close = m[0].slice(tagStart + content.length);
		const result = await fn({ content, attributes: attrs, filename, markup: source });
		out += open + (result && typeof result.code === 'string' ? result.code : content) + close;
		lastIndex = m.index + m[0].length;
	}
	out += source.slice(lastIndex);
	return out;
}

export async function preprocess(source, groups, options) {
	logOnce();
	const groupsArr = Array.isArray(groups) ? groups : groups ? [groups] : [];
	const filename = typeof options === 'string' ? options : options?.filename;
	let code = source;
	for (const group of groupsArr) {
		if (!group) continue;
		if (typeof group.markup === 'function') {
			const r = await group.markup({ content: code, filename });
			if (r && typeof r.code === 'string') code = r.code;
		}
		if (typeof group.script === 'function') {
			code = await runTag(code, new RegExp(SCRIPT_RE.source, 'g'), group.script, filename);
		}
		if (typeof group.style === 'function') {
			code = await runTag(code, new RegExp(STYLE_RE.source, 'g'), group.style, filename);
		}
	}
	return { code };
}

// Some consumers do `import * as svelte from 'svelte/compiler'` and access
// these as properties, so include them on the default export too.
export default { VERSION, compile, compileModule, preprocess };
