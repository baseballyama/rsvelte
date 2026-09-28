import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => 'div', false);

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => 'div', false);

	var node_2 = $.sibling(node_1, 2);

	$.element(node_2, () => "div", false);

	var node_3 = $.sibling(node_2, 2);

	$.element(node_3, () => 'h', false);
	$.append($$anchor, fragment);
}