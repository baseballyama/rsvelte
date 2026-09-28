import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Nested($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'thing', { thing: 2 }, null);
	$.append($$anchor, fragment);
}