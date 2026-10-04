import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Element_children($$anchor) {
	let tag = "div";
	let text = "Hello";
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ id: 'example' }));
		var p = root();
		p.textContent = 'Hello';
		$.append($$anchor, p);
	});
	$.append($$anchor, fragment);
}
