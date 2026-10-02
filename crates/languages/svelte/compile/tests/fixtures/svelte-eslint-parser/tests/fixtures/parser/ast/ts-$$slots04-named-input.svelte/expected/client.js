import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Ts_$$slots04_named_input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$slots;

	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'foo', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'bar', {}, null);
	$.append($$anchor, fragment);
}