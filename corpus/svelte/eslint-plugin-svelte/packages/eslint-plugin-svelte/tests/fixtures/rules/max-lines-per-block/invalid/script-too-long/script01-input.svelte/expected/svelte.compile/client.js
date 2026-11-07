import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Script01_input($$anchor) {
	let count = 0;
	let name = 'World';

	function increment() {
		count++;
	}

	var h1 = root();

	h1.textContent = 'Hello World';
	$.append($$anchor, h1);
}