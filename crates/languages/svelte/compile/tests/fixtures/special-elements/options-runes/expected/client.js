import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Hello</p>`);

export default function Options_runes($$anchor) {
	var p = root();
	$.append($$anchor, p);
}
