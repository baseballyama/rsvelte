import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="red"></div>`);

export default function Red($$anchor) {
	function show(node) {
		return { duration: 500, css: (t) => `opacity: ${t}` };
	}

	var div = root();

	$.transition(1, div, () => show);
	$.append($$anchor, div);
}