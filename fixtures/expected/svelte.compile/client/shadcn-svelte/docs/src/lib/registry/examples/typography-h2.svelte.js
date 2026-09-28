import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">The People of the Kingdom</h2>`);

export default function Typography_h2($$anchor) {
	var h2 = root();

	$.append($$anchor, h2);
}