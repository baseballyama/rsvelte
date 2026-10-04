import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function While($$anchor) {
	const value = "a";
	function run(x) {
		while (x > 2) x--;
		do {
			x++;
		} while (x < 2);
		return x;
	}
	var p = root();
	$.set_class(p, 1, $.clsx(value), 'svelte-1iiwl1o');
	$.append($$anchor, p);
}
