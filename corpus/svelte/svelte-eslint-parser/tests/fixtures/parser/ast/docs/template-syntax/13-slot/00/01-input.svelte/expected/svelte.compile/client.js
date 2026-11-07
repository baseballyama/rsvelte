import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _1_input($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'x', {}, ($$anchor) => {});

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'default', { prop: value }, null);
	$.append($$anchor, fragment);
}