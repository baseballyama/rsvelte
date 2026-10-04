import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Derived_update($$anchor) {
	let count = $.derived(() => 0);
	let after = $.update(count);
	let before = $.update_pre(count, -1);
	var p = root();
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${after ?? ''} ${before ?? ''} ${$.get(count) ?? ''}`));
	$.append($$anchor, p);
}
