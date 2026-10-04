import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Regex($$anchor) {
	const pattern = /[(){}\/]+/giu;
	var p = root();
	$.template_effect(($0) => $.set_class(p, 1, $0, 'svelte-1i6hxbu'), [() => $.clsx(pattern.test("a") ? "a" : "b")]);
	$.append($$anchor, p);
}
