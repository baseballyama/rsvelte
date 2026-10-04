import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Bigint($$anchor) {
	const value = 123n;
	var p = root();
	$.set_class(p, 1, $.clsx(value), 'svelte-h6i544');
	$.append($$anchor, p);
}
