import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Empty_elements01_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}