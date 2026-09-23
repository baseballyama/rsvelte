// `svelte/compiler`'s `compile` / `compileModule` return `js.map` and
// `css.map` as magic-string `SourceMap` instances, so downstream tooling
// calls `map.toUrl()` to inline the map (upstream does it itself in
// `3-transform/css/index.js`, and `vite-plugin-svelte`'s dep optimizer does
// it in `setup-optimizer.js`). The NAPI boundary can only hand back a plain
// Source Map v3 object, so those callers get `map.toUrl is not a function`
// (#4695).
//
// Upstream hits the same problem in `utils/mapped_code.js` and solves it the
// same way — tack the two methods on instead of wrapping in a class, so the
// object stays a plain data map for `JSON.stringify` and structural
// comparison. Both are non-enumerable, which is what keeps `{...map}`,
// `Object.keys(map)` and a serialized envelope byte-identical to before.

'use strict';

// browser vs node.js, mirroring `mapped_code.js`'s `b64enc`.
const b64enc =
	typeof window !== 'undefined' && typeof btoa === 'function'
		? /** @param {string} str */ (str) => btoa(unescape(encodeURIComponent(str)))
		: /** @param {string} str */ (str) => Buffer.from(str).toString('base64');

/**
 * Give a plain Source Map v3 object magic-string's `SourceMap` methods.
 * Returns the same object; a non-object (or a map that already carries
 * `toUrl`, e.g. one a caller assigned) is handed back untouched.
 *
 * @template T
 * @param {T} map
 * @returns {T}
 */
function attachSourceMapMethods(map) {
	if (map === null || typeof map !== 'object') return map;
	if (typeof (/** @type {any} */ (map).toUrl) === 'function') return map;
	Object.defineProperties(map, {
		toString: {
			enumerable: false,
			writable: true,
			configurable: true,
			value: function toString() {
				return JSON.stringify(this);
			},
		},
		toUrl: {
			enumerable: false,
			writable: true,
			configurable: true,
			value: function toUrl() {
				return 'data:application/json;charset=utf-8;base64,' + b64enc(this.toString());
			},
		},
	});
	return map;
}

/**
 * Apply {@link attachSourceMapMethods} to every map a `CompileResult`
 * carries. The JSON NAPI entries (`modernAst`, `compileWithCssHash`) return
 * plain objects rather than an envelope, so they need it at the call site.
 *
 * @template T
 * @param {T} result
 * @returns {T}
 */
function attachResultSourceMapMethods(result) {
	if (result === null || typeof result !== 'object') return result;
	const r = /** @type {any} */ (result);
	if (r.js) attachSourceMapMethods(r.js.map);
	if (r.css) attachSourceMapMethods(r.css.map);
	return result;
}

module.exports = { attachSourceMapMethods, attachResultSourceMapMethods };
