import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	SomeComponent(node, { attr: shorthand });

	var node_1 = $.sibling(node, 2);

	SomeComponent(node_1, { attr: shorthand });
	$.append($$anchor, fragment);
}