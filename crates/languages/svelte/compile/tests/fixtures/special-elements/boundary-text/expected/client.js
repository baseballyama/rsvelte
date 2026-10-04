import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Boundary_text($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.boundary(node, {}, ($$anchor) => {
		$.next();
		var text = $.text('Hello');
		$.append($$anchor, text);
	});
	$.append($$anchor, fragment);
}
