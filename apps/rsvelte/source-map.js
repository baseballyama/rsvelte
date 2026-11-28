// The official compiler's source map of the JavaScript: the compiler's own map, then the
// preprocessor's map merged under it as svelte merges them.
import remapping from '@jridgewell/remapping';

/**
 * @param {string} json The compiler's map, which names the source by its file name.
 * @param {string} source
 * @param {unknown} preprocessed The `sourcemap` option: the preprocessor's map, or its JSON.
 */
export function sourceMap(json, source, preprocessed) {
	const own = JSON.parse(json);
	// Like the official map, it carries the source so that tools need not read the file.
	const map = { ...own, sourcesContent: [source] };
	if (preprocessed)
		Object.assign(
			map,
			merged(map, read(/** @type {string | object} */ (preprocessed), own.sources[0])),
		);
	return Object.defineProperties(map, {
		toString: { value: () => JSON.stringify(map) },
		toUrl: {
			value: () => `data:application/json;charset=utf-8;base64,${base64(JSON.stringify(map))}`,
		},
	});
}

/**
 * The UTF-8 of `text` in base64, in Node.js and in a browser alike.
 * @param {string} text
 */
function base64(text) {
	let binary = '';
	for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
	return btoa(binary);
}

/**
 * The preprocessor's map. One with an unnamed source, as a MagicString without `source` writes,
 * maps the file itself, as Vite reads it.
 * @param {string | object} preprocessed
 * @param {string} name
 */
function read(preprocessed, name) {
	const map = typeof preprocessed === 'string' ? JSON.parse(preprocessed) : { ...preprocessed };
	if (map.sources?.length === 1 && !map.sources[0]) map.sources = [name];
	return map;
}

/**
 * @param {any} map
 * @param {any} preprocessor
 */
function merged(map, preprocessor) {
	// Like svelte, without the sources' content, which only the preprocessor's input holds.
	const result = remapping([map, preprocessor], () => null, true);
	if (!result.file) delete result.file;
	if (!result.sources.length) result.sources = map.sources;
	return result;
}
