import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p>hello</p></div>`);

export default function No_style_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}