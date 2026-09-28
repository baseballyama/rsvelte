import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Main($$anchor) {
	let h1 = 'test';
	var h1_1 = root();

	h1_1.textContent = 'test';
	$.append($$anchor, h1_1);
}