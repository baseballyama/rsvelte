import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_class($$anchor) {
	let tag = "p";
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.set_class($$element, 0, 'example');
	});
	$.append($$anchor, fragment);
}
