import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function X_input($$anchor) {
	let value = "Hello";
	var div = root();

	div.textContent = 'Hello';
	$.append($$anchor, div);
}