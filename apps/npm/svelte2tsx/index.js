// JS wrapper around the wasm `svelte2tsx` export shipped in @rsvelte/compiler.
//
// The wasm bundle returns a JSON string at the boundary (primitives only, no
// custom wasm_bindgen struct per field), so this module's only real work is
// initialising the wasm module on first use and JSON-parsing the result.
//
// The @rsvelte/compiler wasm bundle is wasm-pack --target web. Its default
// async init uses `fetch(new URL(...))`, but the bundle also exports `initSync`,
// which compiles the module synchronously. On Node we read the `.wasm` bytes
// with `fs.readFileSync` and hand them to `initSync`, so the public
// `svelte2tsx()` is synchronous and matches the upstream signature exactly.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import initWasm, { initSync, svelte2tsx as wasmSvelte2tsx } from '@rsvelte/compiler';

let ready = false;

// Synchronous, Node-only wasm init. Reads the bundled `.wasm` and compiles it
// with `initSync` (no `fetch`, no `await`). Idempotent.
function ensureReadySync() {
	if (ready) return;
	let bytes;
	try {
		const require = createRequire(import.meta.url);
		// wasm-pack ships the glue as `<crate>.js` and the module as
		// `<crate>_bg.wasm`; derive the wasm path from the resolved entry so this
		// keeps working across crate renames (rsvelte_core -> rsvelte_lint).
		const entry = require.resolve('@rsvelte/compiler');
		const wasmPath = entry.replace(/\.js$/, '_bg.wasm');
		bytes = readFileSync(wasmPath);
	} catch (cause) {
		throw new Error(
			'svelte2tsx: synchronous wasm initialisation requires a Node.js filesystem. ' +
				'In a browser or bundler without `node:fs`, call `await initialize()` once before ' +
				'calling `svelte2tsx()`.',
			{ cause },
		);
	}
	initSync({ module: bytes });
	ready = true;
}

/**
 * Pre-load and initialise the WebAssembly module.
 *
 * `svelte2tsx()` is synchronous and self-initialises on Node, so calling this is
 * optional there. It exists for environments without a synchronous filesystem
 * (browsers, bundlers): `await initialize()` once, after which `svelte2tsx()`
 * can be called synchronously.
 *
 * @param {any} [input] — Optional `initSync`/`init` input forwarded to the wasm
 *   bundle (e.g. `{ module_or_path }` with wasm bytes or a compiled
 *   `WebAssembly.Module`). Omit on Node to load the bundled `.wasm` from disk.
 * @returns {Promise<void>}
 */
export async function initialize(input) {
	if (ready) return;
	if (input !== undefined) {
		await initWasm(input);
		ready = true;
		return;
	}
	ensureReadySync();
}

// Base64-encode a string, mirroring magic-string's `SourceMap` (prefers
// `btoa`, falls back to Node's `Buffer`) so `map.toUrl()` works in browsers.
function toBase64(str) {
	if (typeof globalThis !== 'undefined' && typeof globalThis.btoa === 'function') {
		return globalThis.btoa(unescape(encodeURIComponent(str)));
	}
	return Buffer.from(str, 'utf-8').toString('base64');
}

// Mirror of magic-string's `SourceMap`: the shape `str.generateMap()` returns
// upstream. Field layout (`version`/`sources`/`names`/`mappings`, plus the
// optional `file`/`sourcesContent`) matches the object magic-string emits, and
// `toString()`/`toUrl()` reproduce its methods so tooling that inlines the map
// keeps working.
class SourceMap {
	constructor(props) {
		this.version = props.version ?? 3;
		this.file = props.file ?? undefined;
		this.sources = props.sources ?? [];
		this.sourcesContent = props.sourcesContent ?? undefined;
		this.names = props.names ?? [];
		this.mappings = props.mappings ?? '';
	}

	toString() {
		return JSON.stringify(this);
	}

	toUrl() {
		return 'data:application/json;charset=utf-8;base64,' + toBase64(this.toString());
	}
}

// Wrap the wasm `exportedNames` payload in the upstream `IExportedNames` shape
// (a `has(name)` predicate over every exported name). The `props`/`all` arrays
// are retained as a backward-compatible rsvelte extension.
function wrapExportedNames(exportedNames) {
	const all = Array.isArray(exportedNames?.all) ? exportedNames.all : [];
	const props = Array.isArray(exportedNames?.props) ? exportedNames.props : [];
	const set = new Set(all);
	return {
		has: (name) => set.has(name),
		props,
		all,
	};
}

// Wrap the wasm `events` payload in the upstream `ComponentEvents` shape
// (`getAll()` returning `{ name, type, doc? }[]`).
function wrapEvents(events) {
	const entries = Array.isArray(events) ? events : [];
	return {
		getAll: () => entries,
	};
}

/**
 * Convert a Svelte component to TypeScript/TSX.
 *
 * Synchronous, matching the upstream `svelte2tsx` signature. On Node the wasm
 * module self-initialises on first call; elsewhere call `await initialize()`
 * first.
 *
 * @param {string} source — Svelte component source code
 * @param {{
 *   filename?: string,
 *   isTsFile?: boolean,
 *   mode?: 'ts' | 'dts',
 *   accessors?: boolean,
 *   namespace?: 'html' | 'svg' | 'mathml',
 *   version?: '4' | '5',
 * }} [options]
 * @returns {import('./index.d.ts').Svelte2TsxResult}
 */
export function svelte2tsx(source, options = {}) {
	ensureReadySync();
	const json = wasmSvelte2tsx(source, JSON.stringify(options));
	const parsed = JSON.parse(json);
	if (parsed.success === false) {
		throw new Error(parsed.error || 'svelte2tsx failed');
	}
	// `map` crosses the wasm boundary as a JSON string (or null in `dts` mode).
	let map = null;
	if (parsed.map != null) {
		map = new SourceMap(typeof parsed.map === 'string' ? JSON.parse(parsed.map) : parsed.map);
	}
	return {
		code: parsed.code,
		map,
		exportedNames: wrapExportedNames(parsed.exportedNames),
		events: wrapEvents(parsed.events),
	};
}

export default svelte2tsx;
