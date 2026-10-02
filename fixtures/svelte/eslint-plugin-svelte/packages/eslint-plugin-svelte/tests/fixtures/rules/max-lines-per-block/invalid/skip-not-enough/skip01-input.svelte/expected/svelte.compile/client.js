import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello</div>`);

export default function Skip01_input($$anchor) {
	// Comment 1
	// Comment 2
	let a = 1;

	let b = 2;
	let c = 3;
	var div = root();

	$.append($$anchor, div);
}