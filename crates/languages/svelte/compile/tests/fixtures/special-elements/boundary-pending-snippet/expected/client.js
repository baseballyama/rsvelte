import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Loading</p>`);

var root_1 = $.from_html(`<p>Ready</p>`);

export default function Boundary_pending_snippet($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	{
		const pending = ($$anchor) => {
			var p = root();
			$.append($$anchor, p);
		};
		$.boundary(node, { pending }, ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		});
	}
	$.append($$anchor, fragment);
}
