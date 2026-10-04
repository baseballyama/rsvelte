import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Generic_arrow($$anchor) {
	const identity = (value) => value;
	const value = identity("a");
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(value), 'svelte-2bhnvg'));
	$.append($$anchor, p);
}
