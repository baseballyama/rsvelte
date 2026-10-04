import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Regex_default($$anchor) {
	const f = (pattern = /[(){}]/) => pattern.test("a");
	var p = root();
	$.template_effect(($0) => $.set_class(p, 1, $0, 'svelte-a5ks3i'), [() => $.clsx(f() ? "a" : "b")]);
	$.append($$anchor, p);
}
