import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let message = '';

	/** @type {import('./$types').Snapshot<string>} */
	const snapshot = {
		capture: () => message,
		restore: (snapshot) => message = snapshot
	};

	var $$exports = { snapshot };
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => message, ($$value) => message = $$value);
	$.append($$anchor, input);

	return $.pop($$exports);
}