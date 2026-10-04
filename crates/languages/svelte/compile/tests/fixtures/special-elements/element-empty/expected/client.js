import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_empty($$anchor) {
	let tag = "div";
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => tag, false);
	$.append($$anchor, fragment);
}
