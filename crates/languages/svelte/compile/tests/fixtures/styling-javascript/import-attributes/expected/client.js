import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import data from "./data.json" with { type: "json" };

var root = $.from_html(`<p></p>`);

export default function Import_attributes($$anchor, $$props) {
	$.push($$props, true);
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(data.value), 'svelte-zxtswk'));
	$.append($$anchor, p);
	$.pop();
}
