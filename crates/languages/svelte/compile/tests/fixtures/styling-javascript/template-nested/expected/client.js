import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Template_nested($$anchor, $$props) {
	$.push($$props, true);
	const text = `a${{ value: `b${1}` }.value}`;
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(text), 'svelte-d636p3'));
	$.append($$anchor, p);
	$.pop();
}
