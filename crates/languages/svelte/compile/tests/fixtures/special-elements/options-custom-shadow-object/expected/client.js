import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Hello</p>`);

export default function Options_custom_shadow_object($$anchor) {
	var p = root();
	$.append($$anchor, p);
}

$.create_custom_element(Options_custom_shadow_object, {}, [], [], { mode: "closed" });
