import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1a3xdlb"></div> <div class="svelte-1a3xdlb"></div> <div class="svelte-1a3xdlb"></div>`, 1);

export default function All01_input($$anchor) {
	let a = 1;
	let b = 2;
	let c = 3;
	var fragment = root();
	var div = $.first_child(fragment);

	div.textContent = '1';

	var div_1 = $.sibling(div, 2);

	div_1.textContent = '2';

	var div_2 = $.sibling(div_1, 2);

	div_2.textContent = '3';
	$.append($$anchor, fragment);
}