import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Main($$anchor) {
	const ctx = 'world';
	var h1 = root();

	h1.textContent = 'Hello world!';
	$.append($$anchor, h1);
}