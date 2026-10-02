import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Component(node, { someProp: true });

	var node_1 = $.sibling(node, 2);

	Component(node_1, { someProp: true });
	$.append($$anchor, fragment);
}