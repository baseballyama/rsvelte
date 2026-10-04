import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Template_object($$anchor) {
	const items = Array.from({ length: 2 }, (_, i) => ({ text: `a${i}` }));
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(items[0].text), 'svelte-im8gsn'));
	$.append($$anchor, p);
}
