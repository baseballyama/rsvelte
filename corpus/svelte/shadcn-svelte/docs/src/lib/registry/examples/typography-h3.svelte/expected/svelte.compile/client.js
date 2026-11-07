import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">The Joke Tax</h3>`);

export default function Typography_h3($$anchor) {
	var h3 = root();

	$.append($$anchor, h3);
}