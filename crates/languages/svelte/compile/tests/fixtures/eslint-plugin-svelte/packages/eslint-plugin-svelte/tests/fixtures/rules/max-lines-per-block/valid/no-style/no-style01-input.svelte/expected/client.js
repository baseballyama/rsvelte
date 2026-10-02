import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function No_style01_input($$anchor) {
	let name = 'World';
	var h1 = root();

	h1.textContent = 'Hello World!';
	$.append($$anchor, h1);
}