import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Input($$anchor) {
	var h1 = root();

	h1.textContent = `hello ${name ?? ''}!`;
	$.append($$anchor, h1);
}