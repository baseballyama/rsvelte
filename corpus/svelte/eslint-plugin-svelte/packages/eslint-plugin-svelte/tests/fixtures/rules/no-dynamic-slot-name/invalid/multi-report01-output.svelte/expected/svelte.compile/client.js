import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Multi_report01_output($$anchor, $$props) {
	const x = 'x';
	const SLOT_NAME = x;
	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'x', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'x', {}, null);

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'x', {}, null);
	$.append($$anchor, fragment);
}