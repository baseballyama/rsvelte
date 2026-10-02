import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1892thy">I'm dynamically imported</p>`);

export default function Dynamic($$anchor) {
	var p = root();

	$.append($$anchor, p);
}