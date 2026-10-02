import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	function myTransition(_node, _params, _context) {
		return {};
	}

	var div = root();

	$.transition(1, div, () => myTransition, () => ({ delay: 100 }));
	$.append($$anchor, div);
}