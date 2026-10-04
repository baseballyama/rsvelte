import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Hello</p>`);

export default function Boundary_attrs($$anchor) {
	function onerror(error, reset) {
		console.log(error);
	}
	function failed() {}
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.boundary(node, { onerror, failed }, ($$anchor) => {
		var p = root();
		$.append($$anchor, p);
	});
	$.append($$anchor, fragment);
}
