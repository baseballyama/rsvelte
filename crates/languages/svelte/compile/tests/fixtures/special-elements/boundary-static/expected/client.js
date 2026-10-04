import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Hello</p>`);

export default function Boundary_static($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.boundary(node, {}, ($$anchor) => {
		var p = root();
		$.append($$anchor, p);
	});
	$.append($$anchor, fragment);
}
