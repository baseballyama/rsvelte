import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Regex_conditional($$anchor, $$props) {
	$.push($$props, true);
	const value = /[)]/.test("a") ? "a" : "b";
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(value), 'svelte-npxfk3'));
	$.append($$anchor, p);
	$.pop();
}
