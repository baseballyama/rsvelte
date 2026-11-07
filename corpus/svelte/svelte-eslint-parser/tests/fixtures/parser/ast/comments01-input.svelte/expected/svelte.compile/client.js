import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Comments01_input($$anchor) {
	var div = root();

	$.set_attribute(div, 'data-text', 'comment comment ');
	$.append($$anchor, div);
}