import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<b></b>`);

export default function Empty_style_element_input($$anchor) {
	let a = 10;
	var b = root();

	b.textContent = '10';
	$.append($$anchor, b);
}