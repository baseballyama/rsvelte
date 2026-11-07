import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1> <h1></h1> <!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = root();
	var h1 = $.first_child(fragment);

	h1.textContent = $$slots.foo;

	var h1_1 = $.sibling(h1, 2);

	h1_1.textContent = $$slots['dashed-name'];

	var node = $.sibling(h1_1, 2);

	$.slot(node, $$props, 'foo', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'dashed-name', {}, null);

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}