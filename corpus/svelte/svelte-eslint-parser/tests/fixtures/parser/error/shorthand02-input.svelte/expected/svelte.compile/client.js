import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Shorthand02_input($$anchor) {
	let name = 'world';
	const max = 0;
	const width = 0;
	var h1 = root();

	$.set_style(h1, '', {}, { 'max-width': max-width });
	h1.textContent = 'Hello world!';
	$.append($$anchor, h1);
}