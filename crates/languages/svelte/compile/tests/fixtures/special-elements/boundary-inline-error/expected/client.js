import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Boundary_inline_error($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.boundary(node, { onerror: (e) => report(e) }, ($$anchor) => {
		$.next();
		var text = $.text('...');
		$.append($$anchor, text);
	});
	$.append($$anchor, fragment);
}
