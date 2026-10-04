import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Each_assertion($$anchor) {
	const values = ["a", "b"];
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 17, () => values, $.index, ($$anchor, value) => {
		var p = root();
		$.template_effect(() => $.set_class(p, 1, $.clsx($.get(value)), 'svelte-ava0yx'));
		$.append($$anchor, p);
	});
	$.append($$anchor, fragment);
}
