import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Ready</p>`);

export default function Boundary_pending_attribute($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.boundary(node, { get pending() {
		return $$props.pending;
	} }, ($$anchor) => {
		var p = root();
		$.append($$anchor, p);
	});
	$.append($$anchor, fragment);
}
