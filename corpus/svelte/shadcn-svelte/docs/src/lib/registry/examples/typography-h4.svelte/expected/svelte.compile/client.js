import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h4 class="scroll-m-20 text-xl font-semibold tracking-tight">People stopped telling jokes</h4>`);

export default function Typography_h4($$anchor) {
	var h4 = root();

	$.append($$anchor, h4);
}