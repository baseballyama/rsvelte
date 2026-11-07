import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><h1 class="svelte-1ikswi4"></h1></div>`);

export default function Single_file_component($$anchor) {
	let title = 'Svelte';
	var div = root();
	var h1 = $.child(div);

	h1.textContent = 'Svelte';
	$.reset(div);
	$.append($$anchor, div);
}