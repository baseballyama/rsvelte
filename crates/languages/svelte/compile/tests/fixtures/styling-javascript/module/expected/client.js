import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export const value = "a";

export function get() {
	return value;
}

var root = $.from_html(`<p></p>`);

export default function Module($$anchor) {
	const local = get();
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(local), 'svelte-kckp2t'));
	$.append($$anchor, p);
}
