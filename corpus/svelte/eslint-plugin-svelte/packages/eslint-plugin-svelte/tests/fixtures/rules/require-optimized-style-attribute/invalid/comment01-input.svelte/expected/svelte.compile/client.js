import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Comment01_input($$anchor) {
	let color = 'blue';
	var div = root();

	$.set_style(div, 'font-size: 12px; /* comment */ color: blue;');
	$.append($$anchor, div);
}