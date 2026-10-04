import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Generator($$anchor, $$props) {
	$.push($$props, true);
	function* values() {
		yield "a";
		yield* ["b"];
	}
	const value = values().next().value;
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(value), 'svelte-z4nc94'));
	$.append($$anchor, p);
	$.pop();
}
