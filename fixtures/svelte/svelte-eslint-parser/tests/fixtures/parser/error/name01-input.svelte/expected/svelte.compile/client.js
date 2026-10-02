import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Name01_input($$anchor) {
	let name = 'world';
	const max = 0;
	const width = 0;
	var h1 = root();

	h1.textContent = 'Hello world!';
	$.transition(3, h1, () => max-width);
	$.append($$anchor, h1);
}