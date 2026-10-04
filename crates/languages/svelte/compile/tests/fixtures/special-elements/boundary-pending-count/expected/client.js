import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Boundary_pending_count($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.boundary(node, {}, ($$anchor) => {
		var p = root();
		var text = $.only_child(p);
		$.template_effect(() => $.set_text(text, `Pending: ${$.eager($.pending) ?? ''}`));
		$.append($$anchor, p);
	});
	$.append($$anchor, fragment);
}
