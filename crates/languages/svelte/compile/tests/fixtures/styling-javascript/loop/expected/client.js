import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Loop($$anchor) {
	const values = ["a", "b"];
	function run() {
		for (let i = 0; i < values.length; i++) {
			if (i) continue;
			console.log(values[i]);
		}
		for (const value of values) console.log(value);
		for (const key in values) console.log(key);
	}
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(values[0]), 'svelte-1xg63bz'));
	$.append($$anchor, p);
}
