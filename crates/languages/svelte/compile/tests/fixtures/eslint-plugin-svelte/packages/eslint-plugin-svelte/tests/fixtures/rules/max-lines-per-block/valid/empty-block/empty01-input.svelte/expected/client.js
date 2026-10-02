import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello</div>`);

export default function Empty01_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}