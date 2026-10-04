import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_static_xmlns($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, () => "svg", true, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ xmlns: 'http://www.w3.org/2000/svg' }));
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);
		$.element(node_1, () => "path", true, ($$element_1, $$anchor) => {
			$.attribute_effect($$element_1, () => ({ xmlns: 'http://www.w3.org/2000/svg' }));
		});
		$.append($$anchor, fragment_1);
	});
	$.append($$anchor, fragment);
}
