import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1wbzr5">I'm dynamically imported</p>`);

export default function Thing($$anchor) {
	var p = root();

	$.append($$anchor, p);
}