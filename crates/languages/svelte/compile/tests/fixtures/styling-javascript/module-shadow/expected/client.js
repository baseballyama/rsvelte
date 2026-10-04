import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

const value = "a";

export function get() {
	return value;
}

var root = $.from_html(`<p></p>`);

export default function Module_shadow($$anchor) {
	const value = "b";
	var p = root();
	$.set_class(p, 1, $.clsx(value), 'svelte-si1omu');
	$.append($$anchor, p);
}
