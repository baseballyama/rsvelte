import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Component($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'box1', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}