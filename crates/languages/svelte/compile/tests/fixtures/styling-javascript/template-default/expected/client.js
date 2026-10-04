import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Template_default($$anchor) {
	const f = (x = `a${1}`) => x;
	var p = root();
	$.template_effect(($0) => $.set_class(p, 1, $0, 'svelte-1mh96db'), [() => $.clsx(f())]);
	$.append($$anchor, p);
}
