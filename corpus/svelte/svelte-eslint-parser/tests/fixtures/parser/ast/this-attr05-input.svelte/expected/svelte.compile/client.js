import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function This_attr05_input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => 'input', false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ class: 'foo', type: 'number' }));
	});

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => `input`, false, ($$element_1, $$anchor) => {
		$.attribute_effect($$element_1, () => ({ class: 'foo', type: 'number' }));
	});

	$.append($$anchor, fragment);
}