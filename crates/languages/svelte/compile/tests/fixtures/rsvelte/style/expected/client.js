import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="big svelte-2kolz5">big text</p>`);

export default function Style($$anchor) {
	var p = root();
	$.append($$anchor, p);
}
