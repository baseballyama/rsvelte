import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Try($$anchor) {
	let value = "a";
	function run() {
		try {
			throw "b";
		} catch (error) {
			value = error;
		} finally {
			console.log(value);
		}
	}
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(value), 'svelte-nct6v0'));
	$.append($$anchor, p);
}
