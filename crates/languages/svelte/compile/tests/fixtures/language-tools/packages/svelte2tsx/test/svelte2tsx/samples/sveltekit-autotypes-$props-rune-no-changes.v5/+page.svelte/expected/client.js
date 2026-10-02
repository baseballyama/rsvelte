import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{form: boolean, data: true }} */
	/** @type {any} */
	const snapshot = {};

	var $$exports = { snapshot };

	return $.pop($$exports);
}