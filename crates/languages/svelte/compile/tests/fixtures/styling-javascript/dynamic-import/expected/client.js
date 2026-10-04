import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Dynamic_import($$anchor) {
	const value = "a";
	async function load() {
		return import("./x.js");
	}
	var p = root();
	$.set_class(p, 1, $.clsx(value), 'svelte-gd3g62');
	$.append($$anchor, p);
}
