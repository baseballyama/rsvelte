import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Main($$anchor) {
	var h1 = root();

	h1.textContent = `Hello ${process.env.TMP_VAR ?? ''}!`;
	$.append($$anchor, h1);
}