// Lazy decoder for the Rust↔JS raw-transfer envelope produced by
// `binding.compileEnvelope`. The byte format is owned by
// `src/napi_raw.rs`; keep both ends in sync.
//
// The returned object is shaped like the legacy `compile()` result
// (`{ js: { code, map }, css: {…}|null, warnings: […], metadata, ast }`)
// but its leaf strings, sourcemap JSON, and warnings array are
// realised on first read. That keeps the hot path (Vite reads
// `result.js.code` and `result.js.map`) down to two `Buffer.toString`
// calls and one `JSON.parse`, with no upfront V8 object tree
// construction.

'use strict';

const MAGIC = 0x31565352; // "RSV1" little-endian
const VERSION = 1;
const HEADER_LEN = 60;

const FLAG_HAS_CSS = 1 << 0;
const FLAG_RUNES = 1 << 1;
const FLAG_CSS_HAS_GLOBAL = 1 << 2;

const WARN_HAS_FILENAME = 1 << 0;
const WARN_HAS_START = 1 << 1;
const WARN_HAS_END = 1 << 2;
const WARN_HAS_FRAME = 1 << 3;

/**
 * Decode an envelope produced by `compileEnvelope` / `compileModuleEnvelope`.
 *
 * @param {Buffer|Uint8Array} buf
 * @returns {object} CompileResult-shaped object with lazy fields
 */
function decodeEnvelope(buf) {
	if (!buf || buf.byteLength < HEADER_LEN) {
		throw new Error(
			`[rsvelte] envelope too small (${buf ? buf.byteLength : 0} bytes, ` +
				`expected at least ${HEADER_LEN})`,
		);
	}

	const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	const magic = view.getUint32(0, true);
	if (magic !== MAGIC) {
		throw new Error(
			`[rsvelte] envelope magic mismatch (got 0x${magic.toString(16)}, ` +
				`expected 0x${MAGIC.toString(16)})`,
		);
	}
	const version = view.getUint32(4, true);
	if (version !== VERSION) {
		throw new Error(
			`[rsvelte] unsupported envelope version ${version} (this build expects ${VERSION})`,
		);
	}
	const totalLen = view.getUint32(8, true);
	if (totalLen !== buf.byteLength) {
		throw new Error(
			`[rsvelte] envelope size mismatch (header says ${totalLen}, buffer is ${buf.byteLength})`,
		);
	}

	const flags = view.getUint32(12, true);
	const jsCodeOff = view.getUint32(16, true);
	const jsCodeLen = view.getUint32(20, true);
	const jsMapOff = view.getUint32(24, true);
	const jsMapLen = view.getUint32(28, true);
	const cssCodeOff = view.getUint32(32, true);
	const cssCodeLen = view.getUint32(36, true);
	const cssMapOff = view.getUint32(40, true);
	const cssMapLen = view.getUint32(44, true);
	const warningsOff = view.getUint32(48, true);
	const warningsCount = view.getUint32(52, true);

	const hasCss = (flags & FLAG_HAS_CSS) !== 0;
	const runes = (flags & FLAG_RUNES) !== 0;

	// `buf.toString('utf8', start, end)` is the V8 fast path for
	// Buffer→string and is consistently faster than wrapping in a
	// TextDecoder; fall back to TextDecoder for plain Uint8Array.
	const slice = bufferIsNodeBuffer(buf)
		? (off, len) => buf.toString('utf8', off, off + len)
		: utf8SliceFromUint8Array.bind(null, buf);

	// js — eagerly construct the wrapper object, but defer string/JSON
	// realisation. Vite always touches `js.code`; the map is only
	// touched when emitting sourcemaps.
	const js = makeCodeMapObject(slice, jsCodeOff, jsCodeLen, jsMapOff, jsMapLen);

	let css = null;
	if (hasCss) {
		css = makeCodeMapObject(slice, cssCodeOff, cssCodeLen, cssMapOff, cssMapLen);
		css.hasGlobal = (flags & FLAG_CSS_HAS_GLOBAL) !== 0;
	}

	const result = {
		js,
		css,
		metadata: { runes },
		ast: null,
	};

	// Warnings: realised lazily — most compilations produce zero, so
	// the common path never enters this branch. Once decoded, the
	// result is cached.
	let warningsCache = null;
	Object.defineProperty(result, 'warnings', {
		enumerable: true,
		configurable: true,
		get() {
			if (warningsCache === null) {
				warningsCache = decodeWarnings(buf, view, warningsOff, warningsCount, slice);
			}
			return warningsCache;
		},
	});

	return result;
}

function makeCodeMapObject(slice, codeOff, codeLen, mapOff, mapLen) {
	const obj = {};
	let codeCache = null;
	Object.defineProperty(obj, 'code', {
		enumerable: true,
		configurable: true,
		get() {
			if (codeCache === null) codeCache = slice(codeOff, codeLen);
			return codeCache;
		},
	});
	let mapCache = mapOff === 0 ? null : undefined;
	Object.defineProperty(obj, 'map', {
		enumerable: true,
		configurable: true,
		get() {
			if (mapCache === undefined) {
				// Parse the sourcemap JSON on first read. Returning the
				// parsed object matches the legacy compile() shape.
				mapCache = JSON.parse(slice(mapOff, mapLen));
			}
			return mapCache;
		},
	});
	return obj;
}

function decodeWarnings(buf, view, off, count, slice) {
	const out = new Array(count);
	let p = off;
	for (let i = 0; i < count; i++) {
		const codeLen = view.getUint32(p, true);
		p += 4;
		const code = slice(p, codeLen);
		p += codeLen;
		const msgLen = view.getUint32(p, true);
		p += 4;
		const message = slice(p, msgLen);
		p += msgLen;
		const flags = view.getUint8(p);
		p += 1;

		const w = { code, message };
		if (flags & WARN_HAS_FILENAME) {
			const len = view.getUint32(p, true);
			p += 4;
			w.filename = slice(p, len);
			p += len;
		}
		if (flags & WARN_HAS_START) {
			w.start = {
				line: view.getUint32(p, true),
				column: view.getUint32(p + 4, true),
				character: view.getUint32(p + 8, true),
			};
			p += 12;
		}
		if (flags & WARN_HAS_END) {
			w.end = {
				line: view.getUint32(p, true),
				column: view.getUint32(p + 4, true),
				character: view.getUint32(p + 8, true),
			};
			p += 12;
		}
		if (w.start && w.end) {
			w.position = [w.start.character, w.end.character];
		}
		if (flags & WARN_HAS_FRAME) {
			const len = view.getUint32(p, true);
			p += 4;
			w.frame = slice(p, len);
			p += len;
		}
		out[i] = w;
	}
	return out;
}

function bufferIsNodeBuffer(buf) {
	return typeof Buffer !== 'undefined' && Buffer.isBuffer(buf);
}

let cachedDecoder = null;
function utf8SliceFromUint8Array(u8, off, len) {
	if (cachedDecoder === null) cachedDecoder = new TextDecoder('utf-8');
	return cachedDecoder.decode(u8.subarray(off, off + len));
}

module.exports = {
	decodeEnvelope,
	HEADER_LEN,
	MAGIC,
	VERSION,
};
