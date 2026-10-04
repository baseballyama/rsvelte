import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_bind_this($$anchor) {
	let node = $.state(void 0);
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);
	$.element(node_1, () => 'div', false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => $.set(node, $$value, true), () => $.get(node));
	});
	$.append($$anchor, fragment);
}
