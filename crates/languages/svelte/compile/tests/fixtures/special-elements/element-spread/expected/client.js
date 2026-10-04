import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_spread($$anchor) {
	let tag = "div";
	let attrs = $.proxy({ id: "test" });
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ ...attrs }));
	});
	$.append($$anchor, fragment);
}
