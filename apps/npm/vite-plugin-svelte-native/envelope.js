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
 * Validate that the byte window `[off, off + len)` lies fully inside a
 * buffer of `bufLen` bytes. The encoder writes offsets/lengths as u32s
 * the decoder otherwise trusts blindly — `buf.toString` / `subarray`
 * silently *clamp* an out-of-range window, so a malformed envelope would
 * decode to truncated data instead of failing loudly. Throw instead (M-012).
 *
 * @param {number} bufLen
 * @param {number} off
 * @param {number} len
 * @param {string} label
 */
function assertWindow(bufLen, off, len, label) {
	if (off < 0 || len < 0 || off + len > bufLen) {
		throw new Error(
			`[rsvelte] envelope ${label} out of bounds ` +
				`(offset ${off} + length ${len} exceeds buffer of ${bufLen} bytes)`,
		);
	}
}

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
	const warningsLen = view.getUint32(56, true);

	const hasCss = (flags & FLAG_HAS_CSS) !== 0;
	const runes = (flags & FLAG_RUNES) !== 0;

	// Validate every field window up front so a malformed envelope throws
	// at decode time rather than silently truncating on first lazy read.
	// A zero offset marks an absent optional field (the header alone fills
	// the first HEADER_LEN bytes, so real data never starts at offset 0).
	const len = buf.byteLength;
	assertWindow(len, jsCodeOff, jsCodeLen, 'js.code');
	if (jsMapOff !== 0) assertWindow(len, jsMapOff, jsMapLen, 'js.map');
	if (hasCss) {
		assertWindow(len, cssCodeOff, cssCodeLen, 'css.code');
		if (cssMapOff !== 0) assertWindow(len, cssMapOff, cssMapLen, 'css.map');
	}
	if (warningsCount > 0) assertWindow(len, warningsOff, warningsLen, 'warnings');

	// `buf.toString('utf8', start, end)` is the V8 fast path for
	// Buffer→string and is consistently faster than wrapping in a
	// TextDecoder; fall back to TextDecoder for plain Uint8Array.
	const slice = bufferIsNodeBuffer(buf)
		? (off, len) => buf.toString('utf8', off, off + len)
		: utf8SliceFromUint8Array.bind(null, buf);

	// js — eagerly construct the wrapper object, but defer string/JSON
	// realisation. Vite always touches `js.code`; the map is only
	// touched when emitting sourcemaps.
	const js = makeCodeMapObject(buf, slice, jsCodeOff, jsCodeLen, jsMapOff, jsMapLen);

	let css = null;
	if (hasCss) {
		css = makeCodeMapObject(buf, slice, cssCodeOff, cssCodeLen, cssMapOff, cssMapLen);
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
				warningsCache = decodeWarnings(buf, view, warningsOff, warningsLen, warningsCount, slice);
			}
			return warningsCache;
		},
	});

	return result;
}

function makeCodeMapObject(buf, slice, codeOff, codeLen, mapOff, mapLen) {
	const obj = {};
	let codeCache = null;
	// `code` and `map` need setters as well as getters — upstream
	// `svelte/compiler` returns them as plain writable strings, and
	// vite-plugin-svelte mutates `compiled.js.code` to wire the CSS
	// import (see compile.js:131, `compiled.js.code += ...`). Without
	// a setter the assignment throws `Cannot set property code of
	// #<Object> which has only a getter` under the strict-mode rolldown
	// runtime and the docs build fails.
	Object.defineProperty(obj, 'code', {
		enumerable: true,
		configurable: true,
		get() {
			if (codeCache === null) codeCache = slice(codeOff, codeLen);
			return codeCache;
		},
		set(value) {
			codeCache = value;
		},
	});
	const hasMap = mapOff !== 0;
	let mapCache = hasMap ? undefined : null;
	Object.defineProperty(obj, 'map', {
		enumerable: true,
		configurable: true,
		get() {
			if (mapCache === undefined) {
				// Parse the sourcemap JSON on first read. Returning the
				// parsed object matches the legacy compile() shape —
				// callers that just want the raw JSON to write to disk
				// should prefer `mapBytes` / `mapText` (no JSON.parse).
				mapCache = JSON.parse(slice(mapOff, mapLen));
			}
			return mapCache;
		},
		set(value) {
			mapCache = value;
		},
	});
	// `mapBytes` returns a zero-copy view into the envelope (Node Buffer
	// or Uint8Array depending on what the caller passed in). Use this
	// when emitting the sourcemap straight to disk / a network stream
	// — no JSON.parse, no UTF-16 string materialisation.
	Object.defineProperty(obj, 'mapBytes', {
		enumerable: false,
		configurable: true,
		get() {
			if (!hasMap) return null;
			return buf.subarray
				? buf.subarray(mapOff, mapOff + mapLen)
				: new Uint8Array(buf.buffer, buf.byteOffset + mapOff, mapLen);
		},
	});
	// `mapText` returns the raw sourcemap JSON as a string without the
	// `JSON.parse` round-trip. Useful when downstream tooling immediately
	// `JSON.stringify`s the map again (Vite's asset emit path).
	Object.defineProperty(obj, 'mapText', {
		enumerable: false,
		configurable: true,
		get() {
			if (!hasMap) return null;
			return slice(mapOff, mapLen);
		},
	});
	return obj;
}

function decodeWarnings(buf, view, off, regionLen, count, slice) {
	// Every record field is bounds-checked against the warnings region
	// (already validated to lie inside the buffer by the caller) so a
	// corrupt internal length throws rather than reading adjacent bytes
	// or overrunning the buffer.
	const end = off + regionLen;
	const need = (p, n, what) => {
		if (p < off || p + n > end) {
			throw new Error(
				`[rsvelte] truncated warning ${what} at offset ${p} ` +
					`(needs ${n} bytes, region ends at ${end})`,
			);
		}
	};
	const out = new Array(count);
	let p = off;
	for (let i = 0; i < count; i++) {
		need(p, 4, 'code length');
		const codeLen = view.getUint32(p, true);
		p += 4;
		need(p, codeLen, 'code');
		const code = slice(p, codeLen);
		p += codeLen;
		need(p, 4, 'message length');
		const msgLen = view.getUint32(p, true);
		p += 4;
		need(p, msgLen, 'message');
		const message = slice(p, msgLen);
		p += msgLen;
		need(p, 1, 'flags');
		const flags = view.getUint8(p);
		p += 1;

		const w = { code, message };
		if (flags & WARN_HAS_FILENAME) {
			need(p, 4, 'filename length');
			const len = view.getUint32(p, true);
			p += 4;
			need(p, len, 'filename');
			w.filename = slice(p, len);
			p += len;
		}
		if (flags & WARN_HAS_START) {
			need(p, 12, 'start position');
			w.start = {
				line: view.getUint32(p, true),
				column: view.getUint32(p + 4, true),
				character: view.getUint32(p + 8, true),
			};
			p += 12;
		}
		if (flags & WARN_HAS_END) {
			need(p, 12, 'end position');
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
			need(p, 4, 'frame length');
			const len = view.getUint32(p, true);
			p += 4;
			need(p, len, 'frame');
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

// =============================================================================
// Batch envelope
// =============================================================================

const BATCH_MAGIC = 0x42565352; // "RSVB" little-endian
const BATCH_VERSION = 1;
const BATCH_HEADER_LEN = 16;
const BATCH_ENTRY_LEN = 12;
const BATCH_STATUS_OK = 0;
const BATCH_STATUS_ERR = 1;

/**
 * Decode a batch envelope produced by `compileBatch`. Returns an
 * array the same length as the input, where each slot is either a
 * `CompileResult` (decoded lazily on first read, like {@link decodeEnvelope})
 * or an `Error` carrying the per-entry failure message.
 *
 * @param {Buffer|Uint8Array} buf
 * @returns {Array<object|Error>}
 */
function decodeBatch(buf) {
	if (!buf || buf.byteLength < BATCH_HEADER_LEN) {
		throw new Error(
			`[rsvelte] batch envelope too small (${buf ? buf.byteLength : 0} bytes, ` +
				`expected at least ${BATCH_HEADER_LEN})`,
		);
	}

	const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	const magic = view.getUint32(0, true);
	if (magic !== BATCH_MAGIC) {
		throw new Error(
			`[rsvelte] batch magic mismatch (got 0x${magic.toString(16)}, ` +
				`expected 0x${BATCH_MAGIC.toString(16)})`,
		);
	}
	const version = view.getUint32(4, true);
	if (version !== BATCH_VERSION) {
		throw new Error(
			`[rsvelte] unsupported batch envelope version ${version} (this build expects ${BATCH_VERSION})`,
		);
	}
	const totalLen = view.getUint32(8, true);
	if (totalLen !== buf.byteLength) {
		throw new Error(
			`[rsvelte] batch envelope size mismatch (header says ${totalLen}, buffer is ${buf.byteLength})`,
		);
	}
	const count = view.getUint32(12, true);

	// The entry table must fit inside the buffer before we index into it.
	const tableEnd = BATCH_HEADER_LEN + count * BATCH_ENTRY_LEN;
	if (tableEnd > buf.byteLength) {
		throw new Error(
			`[rsvelte] batch entry table (${count} entries) exceeds buffer ` +
				`(needs ${tableEnd} bytes, buffer is ${buf.byteLength})`,
		);
	}

	const out = new Array(count);
	for (let i = 0; i < count; i++) {
		const entryOff = BATCH_HEADER_LEN + i * BATCH_ENTRY_LEN;
		const status = view.getUint32(entryOff, true);
		const payloadOff = view.getUint32(entryOff + 4, true);
		const payloadLen = view.getUint32(entryOff + 8, true);
		assertWindow(buf.byteLength, payloadOff, payloadLen, `batch entry ${i}`);
		// Subarray gives a zero-copy view into the same underlying
		// ArrayBuffer; `decodeEnvelope` walks it without further allocation.
		const slice = buf.subarray
			? buf.subarray(payloadOff, payloadOff + payloadLen)
			: new Uint8Array(buf.buffer, buf.byteOffset + payloadOff, payloadLen);
		if (status === BATCH_STATUS_OK) {
			out[i] = decodeEnvelope(slice);
		} else if (status === BATCH_STATUS_ERR) {
			const msg = bufferIsNodeBuffer(slice)
				? slice.toString('utf8')
				: utf8SliceFromUint8Array(slice, 0, slice.byteLength);
			out[i] = new Error(msg);
		} else {
			out[i] = new Error(`[rsvelte] unknown batch entry status ${status} at index ${i}`);
		}
	}
	return out;
}

module.exports = {
	decodeEnvelope,
	decodeBatch,
	HEADER_LEN,
	MAGIC,
	VERSION,
	BATCH_HEADER_LEN,
	BATCH_MAGIC,
	BATCH_VERSION,
};
