import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Dotted.ComponentName(node, {});

	var node_1 = $.sibling(node, 2);

	Dotted.ComponentName(node_1, {});
	$.append($$anchor, fragment);
}