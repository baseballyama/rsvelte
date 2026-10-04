import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Ready</p>`);

var root_1 = $.from_html(`<p>Before</p><!><p>After</p>`, 1);

export default function Boundary_nested($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment));
	$.boundary(node, {}, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);
		$.boundary(node_1, {}, ($$anchor) => {
			var p = root();
			$.append($$anchor, p);
		});
		$.append($$anchor, fragment_1);
	});
	$.next();
	$.append($$anchor, fragment);
}
