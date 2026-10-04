import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Regex_state($$anchor) {
	let pattern = /a/g;
	var p = root();
	$.template_effect(($0) => $.set_class(p, 1, $0, 'svelte-we737y'), [() => $.clsx(pattern.test("a") ? "a" : "b")]);
	$.append($$anchor, p);
}
