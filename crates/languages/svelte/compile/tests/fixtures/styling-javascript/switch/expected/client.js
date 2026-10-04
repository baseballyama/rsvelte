import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Switch($$anchor, $$props) {
	$.push($$props, true);
	const value = "a";
	function run(x) {
		switch (x) {
			case 1:
				return "a";
			case 2:
				throw new Error("b");
			default:
				return "b";
		}
	}
	var p = root();
	$.template_effect(($0) => $.set_class(p, 1, $0, 'svelte-x4829d'), [() => $.clsx(run(1))]);
	$.append($$anchor, p);
	$.pop();
}
