import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-11794o2"></div>`);

export default function App($$anchor) {
	let name = 'World';
	var div = root();

	div.textContent = 'Hello World';
	$.append($$anchor, div);
}