import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => 'div', false);

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => 'div', false);

	var node_2 = $.sibling(node_1, 2);

	$.element(node_2, () => "div", false);

	var node_3 = $.sibling(node_2, 2);

	$.element(node_3, () => 'div', false);

	var node_4 = $.sibling(node_3, 2);

	$.element(node_4, () => "div", false, ($$element_4, $$anchor) => {
		$.set_class($$element_4, 0, 'foo');
	});

	$.append($$anchor, fragment);
}