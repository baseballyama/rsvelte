// Shared bounds-check primitive for the two raw-transfer envelope decoders
// (`../envelope.js` for `compileEnvelope`/`compileModuleEnvelope`, and
// `../parse-envelope.js` for `parseEnvelope`). Both wire formats encode
// offsets/lengths as u32s that the decoder otherwise trusts blindly —
// `Buffer.toString` / `Uint8Array.subarray` silently *clamp* an
// out-of-range window instead of throwing, so a malformed envelope would
// decode to truncated/misaligned data rather than failing loudly (M-012).
//
// Each decoder wraps this in its own `assertWindow` helper so it can throw
// its own Error subtype with its own message prefix (`[rsvelte] envelope …`
// vs `parse envelope: …`) while sharing the actual bounds arithmetic and
// message body.

'use strict';

/**
 * @param {number} off
 * @param {number} len
 * @param {number} bufLen
 * @returns {boolean} true when the byte window `[off, off + len)` does NOT
 *   lie fully inside a buffer of `bufLen` bytes.
 */
function isWindowOutOfBounds(off, len, bufLen) {
	return off < 0 || len < 0 || off + len > bufLen;
}

/**
 * @param {string} label
 * @param {number} off
 * @param {number} len
 * @param {number} bufLen
 * @returns {string}
 */
function windowOutOfBoundsMessage(label, off, len, bufLen) {
	return `${label} out of bounds (offset ${off} + length ${len} exceeds buffer of ${bufLen} bytes)`;
}

module.exports = { isWindowOutOfBounds, windowOutOfBoundsMessage };
