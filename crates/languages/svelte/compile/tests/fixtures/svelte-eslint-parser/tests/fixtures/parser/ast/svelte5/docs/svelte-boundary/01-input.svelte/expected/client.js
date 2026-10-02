import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _1_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror: handler }, ($$anchor) => {
		$.next();

		var text = $.text('...');

		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}