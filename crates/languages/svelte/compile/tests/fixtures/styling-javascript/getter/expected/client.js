import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Getter($$anchor) {
	let name = "a";
	const obj = { get name() {
		return name;
	}, set name(value) {
		name = value;
	} };
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(obj.name), 'svelte-en5ll0'));
	$.append($$anchor, p);
}
