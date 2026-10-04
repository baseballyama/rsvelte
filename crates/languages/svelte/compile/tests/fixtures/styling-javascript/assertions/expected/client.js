import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Assertions($$anchor) {
	const value = "a";
	const fn = (x) => x;
	var p = root();
	$.template_effect(($0) => $.set_class(p, 1, $0, 'svelte-k3c2fa'), [() => $.clsx(fn(value))]);
	$.append($$anchor, p);
}
